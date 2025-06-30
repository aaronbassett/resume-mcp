// LLM Provider Service
// Provider-agnostic interface for various LLM providers
import { createError } from "../utils/errors.ts";
class BaseLLMProvider {
  config;
  provider;
  constructor(provider, config){
    this.provider = provider;
    this.config = config;
  }
}
class OpenAIProvider extends BaseLLMProvider {
  constructor(config){
    super("openai", {
      ...config,
      baseUrl: config.baseUrl || "https://api.openai.com/v1",
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3
    });
  }
  isModelSupported(model) {
    return [
      "gpt-4",
      "gpt-3.5-turbo"
    ].includes(model);
  }
  getDefaultModel() {
    return "gpt-4";
  }
  async generateCompletion(request) {
    if (!this.isModelSupported(request.model)) {
      throw createError("INVALID_PARAMS", `Model ${request.model} not supported by OpenAI provider`);
    }
    const payload = {
      model: request.model,
      messages: request.messages,
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
      top_p: request.topP || 1.0,
      stream: false
    };
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout)
      });
      if (!response.ok) {
        const error = await response.json().catch(()=>({}));
        throw createError("AI_ERROR", `OpenAI API error: ${response.status} - ${error.error?.message || "Unknown error"}`);
      }
      const result = await response.json();
      if (!result.choices || result.choices.length === 0) {
        throw createError("AI_ERROR", "No completion choices returned from OpenAI");
      }
      return {
        content: result.choices[0].message.content.trim(),
        usage: result.usage ? {
          promptTokens: result.usage.prompt_tokens,
          completionTokens: result.usage.completion_tokens,
          totalTokens: result.usage.total_tokens
        } : undefined,
        finishReason: result.choices[0].finish_reason,
        model: result.model,
        provider: this.provider
      };
    } catch (error) {
      if (error.name === "TimeoutError") {
        throw createError("AI_ERROR", "OpenAI request timeout");
      }
      throw error;
    }
  }
}
class AnthropicProvider extends BaseLLMProvider {
  constructor(config){
    super("anthropic", {
      ...config,
      baseUrl: config.baseUrl || "https://api.anthropic.com/v1",
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3
    });
  }
  isModelSupported(model) {
    return [
      "claude-3-sonnet",
      "claude-3-haiku"
    ].includes(model);
  }
  getDefaultModel() {
    return "claude-3-sonnet";
  }
  async generateCompletion(request) {
    if (!this.isModelSupported(request.model)) {
      throw createError("INVALID_PARAMS", `Model ${request.model} not supported by Anthropic provider`);
    }
    // Convert messages to Anthropic format
    const systemMessage = request.messages.find((m)=>m.role === "system");
    const messages = request.messages.filter((m)=>m.role !== "system");
    const payload = {
      model: request.model,
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
      top_p: request.topP || 1.0,
      messages,
      ...systemMessage && {
        system: systemMessage.content
      }
    };
    try {
      const response = await fetch(`${this.config.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout)
      });
      if (!response.ok) {
        const error = await response.json().catch(()=>({}));
        throw createError("AI_ERROR", `Anthropic API error: ${response.status} - ${error.error?.message || "Unknown error"}`);
      }
      const result = await response.json();
      if (!result.content || result.content.length === 0) {
        throw createError("AI_ERROR", "No content returned from Anthropic");
      }
      return {
        content: result.content[0].text.trim(),
        usage: result.usage ? {
          promptTokens: result.usage.input_tokens,
          completionTokens: result.usage.output_tokens,
          totalTokens: result.usage.input_tokens + result.usage.output_tokens
        } : undefined,
        finishReason: result.stop_reason,
        model: result.model,
        provider: this.provider
      };
    } catch (error) {
      if (error.name === "TimeoutError") {
        throw createError("AI_ERROR", "Anthropic request timeout");
      }
      throw error;
    }
  }
}
// LLM Service with provider management and fallback
export class LLMService {
  providers = new Map();
  fallbackChain = [];
  constructor(){
    this.initializeProviders();
  }
  initializeProviders() {
    // Initialize OpenAI if API key available
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (openaiKey) {
      this.providers.set("openai", new OpenAIProvider({
        apiKey: openaiKey
      }));
      this.fallbackChain.push("openai");
    }
    // Initialize Anthropic if API key available
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (anthropicKey) {
      this.providers.set("anthropic", new AnthropicProvider({
        apiKey: anthropicKey
      }));
      this.fallbackChain.push("anthropic");
    }
    if (this.providers.size === 0) {
      console.warn("No LLM providers configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variables.");
    }
  }
  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }
  getProviderForModel(model) {
    for (const [providerName, provider] of this.providers){
      if (provider.isModelSupported(model)) {
        return providerName;
      }
    }
    return null;
  }
  getDefaultModel() {
    if (this.providers.has("openai")) {
      return this.providers.get("openai").getDefaultModel();
    }
    if (this.providers.has("anthropic")) {
      return this.providers.get("anthropic").getDefaultModel();
    }
    throw createError("CONFIG_ERROR", "No LLM providers available");
  }
  async generateCompletion(request) {
    if (this.providers.size === 0) {
      throw createError("CONFIG_ERROR", "No LLM providers configured");
    }
    // Try to find the preferred provider for the model
    const preferredProvider = this.getProviderForModel(request.model);
    if (preferredProvider && this.providers.has(preferredProvider)) {
      try {
        return await this.providers.get(preferredProvider).generateCompletion(request);
      } catch (error) {
        console.warn(`Primary provider ${preferredProvider} failed:`, error.message);
      // Continue to fallback logic
      }
    }
    // Try fallback providers
    const lastError = [];
    for (const providerName of this.fallbackChain){
      const provider = this.providers.get(providerName);
      if (!provider || providerName === preferredProvider) continue;
      try {
        // Use provider's default model if requested model not supported
        const modelToUse = provider.isModelSupported(request.model) ? request.model : provider.getDefaultModel();
        const fallbackRequest = {
          ...request,
          model: modelToUse
        };
        return await provider.generateCompletion(fallbackRequest);
      } catch (error) {
        lastError.push(error);
        console.warn(`Fallback provider ${providerName} failed:`, error.message);
      }
    }
    // All providers failed
    throw createError("AI_ERROR", `All LLM providers failed. Last errors: ${lastError.map((e)=>e.message).join(", ")}`);
  }
}
// Singleton instance
let llmServiceInstance = null;
export function getLLMService() {
  if (!llmServiceInstance) {
    llmServiceInstance = new LLMService();
  }
  return llmServiceInstance;
}
