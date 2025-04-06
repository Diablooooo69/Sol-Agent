import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { useWallet } from '@/lib/walletAdapter';
import { BrutalistCard } from '@/components/ui/brutalist-card';
import { ExternalLink } from 'lucide-react';

interface LLMEntry {
  name: string;
  description: string;
  url: string;
  category: string;
}

const LLMPage: React.FC = () => {
  const { wallet } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Source data from https://github.com/Hannibal046/Awesome-LLM
  const llmData: LLMEntry[] = [
    // Large Language Models - Open Source
    {
      name: "LLaMA",
      description: "Open and efficient foundation language models by Meta",
      url: "https://github.com/facebookresearch/llama",
      category: "Open Source LLMs"
    },
    {
      name: "LLaMA 2",
      description: "The next generation of Meta's open source large language model",
      url: "https://ai.meta.com/llama/",
      category: "Open Source LLMs"
    },
    {
      name: "Alpaca",
      description: "A strong instruction-following model by Stanford",
      url: "https://github.com/tatsu-lab/stanford_alpaca",
      category: "Open Source LLMs"
    },
    {
      name: "Vicuna",
      description: "An open-source chatbot impressing with its conversational abilities",
      url: "https://github.com/lm-sys/FastChat",
      category: "Open Source LLMs"
    },
    {
      name: "Dolly",
      description: "Databricks' instruction-following LLM",
      url: "https://github.com/databrickslabs/dolly",
      category: "Open Source LLMs"
    },
    {
      name: "Falcon",
      description: "Technology Innovation Institute's open LLM",
      url: "https://falconllm.tii.ae/",
      category: "Open Source LLMs"
    },
    {
      name: "Pythia",
      description: "A suite of foundation models from EleutherAI",
      url: "https://github.com/EleutherAI/pythia",
      category: "Open Source LLMs"
    },
    {
      name: "RedPajama",
      description: "An open-source recipe to create LLaMA-like models",
      url: "https://github.com/togethercomputer/RedPajama-Data",
      category: "Open Source LLMs"
    },
    {
      name: "MPT",
      description: "MosaicML's instruction-tuned language models",
      url: "https://www.mosaicml.com/blog/mpt-7b",
      category: "Open Source LLMs"
    },
    {
      name: "StableLM",
      description: "Stability AI's language models",
      url: "https://github.com/Stability-AI/StableLM",
      category: "Open Source LLMs"
    },
    {
      name: "BLOOM",
      description: "BigScience's 176B-parameter multilingual LLM",
      url: "https://huggingface.co/bigscience/bloom",
      category: "Open Source LLMs"
    },
    {
      name: "OPT",
      description: "Meta's Open Pretrained Transformer LLMs",
      url: "https://huggingface.co/facebook/opt-66b",
      category: "Open Source LLMs"
    },
    {
      name: "Cerebras-GPT",
      description: "A family of open models trained by Cerebras",
      url: "https://huggingface.co/cerebras",
      category: "Open Source LLMs"
    },
    {
      name: "OpenLLaMA",
      description: "Open reproduction of Meta's LLaMA",
      url: "https://github.com/openlm-research/open_llama",
      category: "Open Source LLMs"
    },
    {
      name: "GPT-J",
      description: "EleutherAI's 6B parameter model",
      url: "https://github.com/kingoflolz/mesh-transformer-jax",
      category: "Open Source LLMs"
    },
    {
      name: "GPT-NeoX",
      description: "EleutherAI's 20B parameter model",
      url: "https://github.com/EleutherAI/gpt-neox",
      category: "Open Source LLMs"
    },
    
    // Proprietary Models
    {
      name: "GPT-4",
      description: "OpenAI's most advanced model, capable of multimodal understanding",
      url: "https://openai.com/gpt-4",
      category: "Proprietary LLMs"
    },
    {
      name: "Claude",
      description: "Anthropic's helpful, harmless, and honest AI assistant",
      url: "https://www.anthropic.com/claude",
      category: "Proprietary LLMs"
    },
    {
      name: "Gemini",
      description: "Google's multimodal AI system, formerly Bard",
      url: "https://gemini.google.com",
      category: "Proprietary LLMs"
    },
    {
      name: "GPT-3.5",
      description: "OpenAI's ChatGPT model family",
      url: "https://platform.openai.com/docs/models",
      category: "Proprietary LLMs"
    },
    {
      name: "PaLM 2",
      description: "Google's next-generation large language model",
      url: "https://ai.google/discover/palm2/",
      category: "Proprietary LLMs"
    },
    {
      name: "Command",
      description: "Cohere's language model for enterprise use cases",
      url: "https://cohere.com/models/command",
      category: "Proprietary LLMs"
    },
    {
      name: "Claude 2.1",
      description: "Anthropic's model with enhanced reasoning capabilities",
      url: "https://www.anthropic.com/news/claude-2-1",
      category: "Proprietary LLMs"
    },
    
    // Multimodal Models
    {
      name: "GPT-4V",
      description: "OpenAI's vision-enabled model that can process image inputs",
      url: "https://openai.com/research/gpt-4v-system-card",
      category: "Multimodal Models"
    },
    {
      name: "DALL-E 3",
      description: "OpenAI's image generation model with improved coherence and prompt following",
      url: "https://openai.com/dall-e-3",
      category: "Multimodal Models"
    },
    {
      name: "Flamingo",
      description: "DeepMind's visual language model",
      url: "https://www.deepmind.com/blog/tackling-multiple-tasks-with-a-single-visual-language-model",
      category: "Multimodal Models"
    },
    {
      name: "Stable Diffusion",
      description: "Open-source text-to-image model by Stability AI",
      url: "https://github.com/Stability-AI/stablediffusion",
      category: "Multimodal Models"
    },
    {
      name: "CLIP",
      description: "OpenAI's model connecting text and images",
      url: "https://github.com/openai/CLIP",
      category: "Multimodal Models"
    },
    {
      name: "Midjourney",
      description: "Text-to-image AI system for artistic creations",
      url: "https://www.midjourney.com/",
      category: "Multimodal Models"
    },
    {
      name: "Gemini Pro Vision",
      description: "Google's multimodal model that can process text, images, and other formats",
      url: "https://deepmind.google/technologies/gemini/",
      category: "Multimodal Models"
    },
    {
      name: "LLaVA",
      description: "Large Language and Vision Assistant built on LLaMA",
      url: "https://github.com/haotian-liu/LLaVA",
      category: "Multimodal Models"
    },
    
    // Fine-tuning Tools
    {
      name: "PEFT",
      description: "Parameter-Efficient Fine-Tuning methods for LLMs",
      url: "https://github.com/huggingface/peft",
      category: "Fine-tuning Tools"
    },
    {
      name: "LoRA",
      description: "Low-Rank Adaptation method for efficiently fine-tuning large models",
      url: "https://github.com/microsoft/LoRA",
      category: "Fine-tuning Tools"
    },
    {
      name: "QLoRA",
      description: "Efficient fine-tuning through quantization and LoRA",
      url: "https://github.com/artidoro/qlora",
      category: "Fine-tuning Tools"
    },
    {
      name: "DeepSpeed",
      description: "Deep learning optimization library for model training",
      url: "https://github.com/microsoft/DeepSpeed",
      category: "Fine-tuning Tools"
    },
    
    // LLM Frameworks
    {
      name: "LangChain",
      description: "Framework for developing applications powered by language models",
      url: "https://github.com/langchain-ai/langchain",
      category: "LLM Frameworks"
    },
    {
      name: "LlamaIndex",
      description: "Data framework for LLM applications to connect to external data",
      url: "https://github.com/jerryjliu/llama_index",
      category: "LLM Frameworks"
    },
    {
      name: "Transformers",
      description: "Hugging Face's state-of-the-art NLP library",
      url: "https://github.com/huggingface/transformers",
      category: "LLM Frameworks"
    },
    {
      name: "Haystack",
      description: "Open-source framework for building NLP applications",
      url: "https://github.com/deepset-ai/haystack",
      category: "LLM Frameworks"
    },
    {
      name: "AutoGPT",
      description: "Autonomous agent system using GPT-4",
      url: "https://github.com/Significant-Gravitas/Auto-GPT",
      category: "LLM Frameworks"
    },
    {
      name: "LangFlow",
      description: "UI for LangChain, making it easy to experiment and prototype",
      url: "https://github.com/logspace-ai/langflow",
      category: "LLM Frameworks"
    },
    
    // Deployment & Optimization
    {
      name: "vLLM",
      description: "High-throughput and memory-efficient LLM inference engine",
      url: "https://github.com/vllm-project/vllm",
      category: "Deployment & Optimization"
    },
    {
      name: "TensorRT-LLM",
      description: "NVIDIA's library for optimizing LLM inference",
      url: "https://github.com/NVIDIA/TensorRT-LLM",
      category: "Deployment & Optimization"
    },
    {
      name: "GGML",
      description: "Tensor library for machine learning with focus on LLM inference",
      url: "https://github.com/ggerganov/ggml",
      category: "Deployment & Optimization"
    },
    {
      name: "GPTQ",
      description: "Post-training quantization for LLMs",
      url: "https://github.com/IST-DASLab/gptq",
      category: "Deployment & Optimization"
    },
    {
      name: "llama.cpp",
      description: "Inference of LLM models in pure C/C++",
      url: "https://github.com/ggerganov/llama.cpp",
      category: "Deployment & Optimization"
    },
    {
      name: "Petals",
      description: "Distributed inference system to run LLMs collaboratively",
      url: "https://github.com/bigscience-workshop/petals",
      category: "Deployment & Optimization"
    },
    
    // MCP (Model Customization & Prompting)
    {
      name: "ROME",
      description: "Rank-One Model Editing for updating facts in language models",
      url: "https://github.com/kmeng01/rome",
      category: "Model Customization & Prompting"
    },
    {
      name: "MEMIT",
      description: "Memory Editing Method for updating knowledge in language models",
      url: "https://github.com/kmeng01/memit",
      category: "Model Customization & Prompting"
    },
    {
      name: "Guidance",
      description: "A guidance language for controlling LLMs",
      url: "https://github.com/microsoft/guidance",
      category: "Model Customization & Prompting"
    },
    {
      name: "DSPy",
      description: "Framework for algorithmically optimizing LLM prompts",
      url: "https://github.com/stanfordnlp/dspy",
      category: "Model Customization & Prompting"
    },
    {
      name: "Outlines",
      description: "Structured generation with LLMs",
      url: "https://github.com/outlines-dev/outlines",
      category: "Model Customization & Prompting"
    },
    {
      name: "Promptflow",
      description: "Build, compare, and deploy workflows with LLMs",
      url: "https://github.com/microsoft/promptflow",
      category: "Model Customization & Prompting"
    },
    {
      name: "LangSmith",
      description: "Tool for debugging, testing, and monitoring LLM applications",
      url: "https://www.langchain.com/langsmith",
      category: "Model Customization & Prompting"
    },
    {
      name: "Prompt Engineering Guide",
      description: "Comprehensive guide to prompt engineering techniques",
      url: "https://github.com/dair-ai/Prompt-Engineering-Guide",
      category: "Model Customization & Prompting"
    },
    {
      name: "LMFlow",
      description: "Toolbox for large language model fine-tuning with human feedback",
      url: "https://github.com/OptimalScale/LMFlow",
      category: "Model Customization & Prompting"
    },
    {
      name: "NVIDIA NeMo",
      description: "Toolkit for building AI applications with LLMs",
      url: "https://github.com/NVIDIA/NeMo",
      category: "Model Customization & Prompting"
    },
  ];
  
  // All LLM categories for filtering
  const categories = ['all', ...new Set(llmData.map(item => item.category))];
  
  // Filter data based on selected category
  const filteredData = llmData.filter(item => {
    // Filter by category
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    return true;
  });
  
  // Group data by category for display
  const groupedData: Record<string, LLMEntry[]> = {};
  
  filteredData.forEach(item => {
    if (!groupedData[item.category]) {
      groupedData[item.category] = [];
    }
    groupedData[item.category].push(item);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Header title="LLM Library" wallet={wallet} />
      
      {/* Category Filter */}
      <div className="mb-10 mt-6 overflow-x-auto">
        <div className="flex gap-3 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 whitespace-nowrap font-bold text-sm rounded-md border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                selectedCategory === category 
                  ? 'bg-brutalism-purple text-white' 
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      {Object.keys(groupedData).length > 0 ? (
        Object.entries(groupedData).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-mono font-bold mb-6 border-b-4 border-black pb-2">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <BrutalistCard key={item.name} className="p-5 border-4 border-black h-full flex flex-col hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-brutalism-purple bg-opacity-10 rounded-full hover:bg-opacity-20 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-brutalism-purple" />
                    </a>
                  </div>
                  <p className="text-gray-700 flex-grow text-sm">{item.description}</p>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brutalism-purple hover:underline text-xs flex items-center"
                    >
                      <span>{item.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                    </a>
                  </div>
                </BrutalistCard>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16 border-4 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-2xl font-bold mb-2">No results found</h3>
          <p className="text-gray-600">Try selecting a different category</p>
        </div>
      )}
      
      {/* Resources Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-mono font-bold mb-6 border-b-4 border-black pb-2">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <BrutalistCard className="p-5 border-4 border-black hover:bg-gray-50 transition-colors">
            <h3 className="text-xl font-bold mb-2">Research Papers</h3>
            <p className="text-gray-700 mb-4 text-sm">
              Stay updated with the latest academic research on LLMs and their applications.
            </p>
            <a 
              href="https://arxiv.org/search/?searchtype=all&query=large+language+models&abstracts=show&size=50&order=-announced_date_first" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-brutalism-purple"
            >
              <span>Explore on arXiv</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </BrutalistCard>
          
          <BrutalistCard className="p-5 border-4 border-black hover:bg-gray-50 transition-colors">
            <h3 className="text-xl font-bold mb-2">Hugging Face</h3>
            <p className="text-gray-700 mb-4 text-sm">
              Access thousands of pre-trained models and datasets for natural language processing.
            </p>
            <a 
              href="https://huggingface.co/models?pipeline_tag=text-generation&sort=downloads" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-brutalism-purple"
            >
              <span>Browse models</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </BrutalistCard>
          
          <BrutalistCard className="p-5 border-4 border-black hover:bg-gray-50 transition-colors">
            <h3 className="text-xl font-bold mb-2">Papers With Code</h3>
            <p className="text-gray-700 mb-4 text-sm">
              Find implementations of state-of-the-art LLM papers with code examples.
            </p>
            <a 
              href="https://paperswithcode.com/task/language-modelling" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-brutalism-purple"
            >
              <span>View implementations</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </BrutalistCard>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-gray-100 border-2 border-gray-300 rounded-md text-xs text-gray-600">
        <p>
          <strong>Disclaimer:</strong> This page compiles information about various LLMs from the Awesome-LLM GitHub repository for educational purposes. 
          The content is not exhaustive and may not represent the latest developments. 
          Always refer to the original sources for the most up-to-date information.
        </p>
      </div>
    </div>
  );
};

export default LLMPage;