# AI providers and privacy

JobPrep sends text to an AI model to generate questions and feedback. What leaves your machine depends on the provider you configure.

## What is sent

| Feature | Data sent to the model |
| --- | --- |
| Question generation | Target role, level and topics |
| Answer feedback | The question and your answer |
| CV and cover letter tools | The CV or letter text and the job description you provide |
| AI Coach | Your messages in the conversation |

Recordings, passwords and payment details are never sent to AI providers. Video rooms (LiveKit), the optional HeyGen avatar, code execution and billing are separate services with their own data flows; enable them only when you accept that.

## Provider options

| Provider | Where data goes | Cost | Config |
| --- | --- | --- | --- |
| Ollama (local) | Stays on your machine | Free | `OLLAMA_HOST`, `OLLAMA_MODEL` |
| Anthropic | Anthropic API | Pay per use | `ANTHROPIC_API_KEY` |
| OpenAI or compatible | That provider or gateway | Pay per use | `OPENAI_API_KEY`, `OPENAI_BASE_URL` |

Providers are bring-your-own-key. Check each provider's retention and training policy before sending real personal or employer-confidential content.

## Fully local with Ollama

```bash
ollama pull llama3.2
ollama serve            # listens on http://localhost:11434
```

In `.env`:

```bash
OLLAMA_HOST=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2:latest
AI_COACH_DEFAULT_MODEL=ollama:llama3.2:latest
```

When the app runs inside Docker, use `http://host.docker.internal:11434/v1` for `OLLAMA_HOST` (on Linux add `extra_hosts: ["host.docker.internal:host-gateway"]` to the `app` service).

Smaller local models give weaker feedback than hosted ones; try a larger model if answers feel shallow.

## Tips

- Use throwaway or sample data while developing.
- Keep API keys in `.env`; it is gitignored. Never commit it.
- Report privacy concerns through [SECURITY.md](../SECURITY.md).
