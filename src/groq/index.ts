import Groq, { InternalServerError, RateLimitError } from 'groq-sdk';
import { RequestOptions } from 'groq-sdk/core';
import { Stream } from 'groq-sdk/lib/streaming';
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsBase,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
} from 'groq-sdk/resources/chat/completions';
import { config } from '../config';
import { Model } from './models';

const groq = new Groq({
  apiKey: config.groqApiKey,
});

type AIResponse =
  | Promise<ChatCompletion>
  | Promise<Stream<ChatCompletionChunk>>;

type ModelPriority = {
  name: string;
  primary: Model;
  secondary: Model;
  current: Model;
  retryPrimaryMs: number; // Через какое время после получения 429 от primary модели и переключения на secondary можно снова переключиться на primary
  timeout: NodeJS.Timeout | null;
};

export const modelPriorities = new Map<string, ModelPriority>();

export function createModelPriority(
  name: string,
  primary: Model,
  secondary: Model,
  retryPrimaryMs: number
) {
  const modelPriority: ModelPriority = {
    name,
    primary,
    secondary,
    retryPrimaryMs,
    current: primary,
    timeout: null,
  };
  modelPriorities.set(name, modelPriority);
  return modelPriority;
}

export const defaultModelPriority = createModelPriority(
  'default',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  1000 * 60 * 4
);

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

function aiChat(
  body: PartialBy<ChatCompletionCreateParamsNonStreaming, 'model'>,
  modelPriority?: ModelPriority | null | string,
  options?: RequestOptions
): Promise<ChatCompletion>;
function aiChat(
  body: PartialBy<ChatCompletionCreateParamsStreaming, 'model'>,
  modelPriority?: ModelPriority | null | string,
  options?: RequestOptions
): Promise<Stream<ChatCompletionChunk>>;
function aiChat(
  body: PartialBy<ChatCompletionCreateParamsBase, 'model'>,
  modelPriority?: ModelPriority | null | string,
  options?: RequestOptions
): Promise<Stream<ChatCompletionChunk> | ChatCompletion>;
function aiChat(
  body: PartialBy<ChatCompletionCreateParams, 'model'>,
  modelPriority?: ModelPriority | null | string,
  options?: RequestOptions
): AIResponse {
  let model = body.model;
  let explicitModel = true;
  let usingModelPriotity: ModelPriority;
  if (!model) {
    explicitModel = false;
    usingModelPriotity = modelPriority
      ? typeof modelPriority === 'string'
        ? modelPriorities.get(modelPriority) || defaultModelPriority
        : modelPriority
      : defaultModelPriority;
    model = usingModelPriotity.current;
  }

  return groq.chat.completions
    .create({ ...body, model }, options)
    .then((res) => res)
    .catch((error) => {
      if (
        error instanceof RateLimitError &&
        !explicitModel &&
        model === usingModelPriotity.primary
      ) {
        usingModelPriotity.current = usingModelPriotity.secondary;
        if (usingModelPriotity.timeout)
          clearTimeout(usingModelPriotity.timeout);

        usingModelPriotity.timeout = setTimeout(() => {
          usingModelPriotity.current = usingModelPriotity.primary;
          console.log(
            `[groq] Switching back to "${usingModelPriotity.primary}",`,
            `from "${usingModelPriotity.secondary}"`,
            `after ${usingModelPriotity.retryPrimaryMs / 1000} seconds"`,
            `according to model priority "${usingModelPriotity.name}`
          );
        }, usingModelPriotity.retryPrimaryMs);

        console.log(
          `[groq] Got 429 for model "${usingModelPriotity.primary}",`,
          `switching to "${usingModelPriotity.secondary}"`,
          `according to model priority "${usingModelPriotity.name}.`,
          `Switching back in ${
            usingModelPriotity.retryPrimaryMs / 1000
          } seconds"`
        );
        return aiChat(body, usingModelPriotity, options);
      } else if (error instanceof InternalServerError) {
        return new Promise((resolve) => setTimeout(resolve, 3000)).then(() =>
          aiChat(body, usingModelPriotity, options)
        );
      }
      throw error;
    }) as AIResponse;
}

export { groq, aiChat };
