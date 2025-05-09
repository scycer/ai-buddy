# Dev Buddy: A Simple Chat Application

## Overview

Dev Buddy is a flexible chat application that supports multiple Large Language Model providers. Currently supported:

- OpenAI (via official API)
- LMStudio (via WebSocket connection)

## Installation

```sh
pnpm install
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```
# Required for OpenAI
OPENAI_API_KEY=your_api_key_here

# Optional for LMStudio (defaults shown below)
LMSTUDIO_HOST=ws://192.168.1.147:1234
LMSTUDIO_MODEL=qwen3-14b

# Optional - set default provider
LLM_PROVIDER=lmstudio  # or 'openai'
```

## Usage

### Running with OpenAI

```sh
pnpm start -- --provider=openai
```

### Running with LMStudio

```sh
pnpm start -- --provider=lmstudio
```

If no provider is specified, it will use the value from the `LLM_PROVIDER` environment variable, or default to LMStudio if not set.

## Features

- Simple chat interface in the terminal
- Support for multiple LLM providers (OpenAI, LMStudio)
- Token usage estimation and cost tracking
- Easy switching between providers with command-line arguments
- Response formatting and error handling

## Architecture

Dev Buddy is built with a modular architecture that allows for easy extension and maintenance:

### Services

- **ChatService**: Manages the chat session and interactions
- **OpenAIService**: Handles API calls to OpenAI
- **LMStudioService**: Communicates with LMStudio via WebSocket
- **InputService**: Processes user input from the terminal

### Utils

- **Chat Utils**: Helper functions for cost calculation and command parsing
- **String Utils**: String manipulation utilities including chunking for large responses

## Development

### Running the Tests

```sh
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate test coverage report
pnpm test:coverage
```

### Project Structure

```
├── src/
│   ├── services/          # Service layer (API interactions)
│   │   ├── base-llm.service.ts  # Base interface for LLM services
│   │   ├── chat.service.ts      # Chat session management
│   │   ├── input.service.ts     # User input handling
│   │   ├── lmstudio.service.ts  # LMStudio integration
│   │   └── openai.service.ts    # OpenAI integration
│   ├── utils/             # Utility functions
│   │   ├── chat.utils.ts        # Chat-related utilities
│   │   └── string.utils.ts      # String manipulation utilities
│   └── index.ts           # Entry point
├── tests/                # Test files
└── package.json         # Project configuration
```

## Troubleshooting

### LMStudio Connection Issues

If you encounter issues connecting to LMStudio:

1. Make sure LMStudio is running and the server is active in the "Server" tab
2. Verify the WebSocket URL is correct in your `.env` file or use the command line argument
3. Check that you're using the correct model name
4. Ensure LMStudio server can accept connections (no firewall blocking ports)

```sh
# Example with all parameters specified
pnpm start -- --provider=lmstudio LMSTUDIO_HOST=ws://localhost:1234 LMSTUDIO_MODEL=qwen3-14b
```

### OpenAI API Key Issues

If you're using the OpenAI provider:

1. Ensure your OpenAI API key is correctly set in the `.env` file
2. Verify that your API key has sufficient quota and permissions
3. Check if there are any regional restrictions for your API key

## Adding New Models/Providers

To add support for a new LLM provider:

1. Create a new service class in `src/services/` that implements the `LLMService` interface
2. Add the new provider option in the `getLLMService` function in `src/index.ts`
3. Implement token counting and cost estimation for the new provider
4. Add appropriate environment variables and configuration options

## License

ISC
