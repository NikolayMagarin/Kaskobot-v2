/*
meta-llama/llama-4-maverick-17b-128e-instruct    | preview         | text + images -> text
meta-llama/llama-4-scout-17b-16e-instruct        | preview         | text + images -> text
meta-llama/llama-guard-4-12b                     | production      | text + images -> text (guarded)
llama3-8b-8192                                   | production      | text -> text
llama-3.3-70b-versatile                          | production      | text -> text
llama3-70b-8192                                  | production      | text -> text
gemma2-9b-it                                     | production      | text -> text
llama-3.1-8b-instant                             | production      | text -> text (really fast)
qwen-qwq-32b                                     | preview         | text -> text (reasoning)
deepseek-r1-distill-llama-70b                    | preview         | text -> text (reasoning)
meta-llama/llama-prompt-guard-2-22m              | preview         | text -> text (guarded)
meta-llama/llama-prompt-guard-2-86m              | preview         | text -> text (guarded)
mistral-saba-24b                                 | preview         | text -> text (perhaps bad russian)
allam-2-7b                                       | preview         | text -> text (perhaps bad russian)
whisper-large-v3-turbo                           | production      | speech -> text
whisper-large-v3                                 | production      | speech -> text
distil-whisper-large-v3-en                       | production      | speech -> text
playai-tts                                       | preview         | text -> speech
playai-tts-arabic                                | preview         | text -> speech
compound-beta                                    | preview system  | text -> text + web search + code execution
compound-beta-mini                               | preview system  | text -> text + web search + code execution
llama-guard-3-8b                                 | deprecated      | text -> text (guarded)
*/

export type Model =
  | 'meta-llama/llama-4-maverick-17b-128e-instruct'
  | 'meta-llama/llama-4-scout-17b-16e-instruct'
  | 'meta-llama/llama-guard-4-12b'
  | 'llama3-8b-8192'
  | 'llama-3.3-70b-versatile'
  | 'llama3-70b-8192'
  | 'gemma2-9b-it'
  | 'llama-3.1-8b-instant'
  | 'qwen-qwq-32b'
  | 'deepseek-r1-distill-llama-70b'
  | 'meta-llama/llama-prompt-guard-2-22m'
  | 'meta-llama/llama-prompt-guard-2-86m'
  | 'mistral-saba-24b'
  | 'allam-2-7b'
  | 'whisper-large-v3-turbo'
  | 'whisper-large-v3'
  | 'distil-whisper-large-v3-en'
  | 'playai-tts'
  | 'playai-tts-arabic'
  | 'compound-beta'
  | 'compound-beta-mini'
  | 'llama-guard-3-8b';
