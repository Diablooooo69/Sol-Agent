import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import { useWallet } from '@/lib/walletAdapter';
import { BrutalistCard } from '@/components/ui/brutalist-card';
import { Search, ExternalLink } from 'lucide-react';

interface LLMEntry {
  name: string;
  description: string;
  url: string;
  category: string;
}

const LLMPage: React.FC = () => {
  const { wallet } = useWallet();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Source data from https://github.com/Hannibal046/Awesome-LLM
  const llmData: LLMEntry[] = [
    // Large Language Models
    {
      name: "LLaMA",
      description: "Open and efficient foundation language models by Meta",
      url: "https://github.com/facebookresearch/llama",
      category: "Open LLMs"
    },
    {
      name: "LLaMA 2",
      description: "The next generation of Meta's open source large language model",
      url: "https://ai.meta.com/llama/",
      category: "Open LLMs"
    },
    {
      name: "Alpaca",
      description: "A strong instruction-following model by Stanford",
      url: "https://github.com/tatsu-lab/stanford_alpaca",
      category: "Open LLMs"
    },
    {
      name: "Vicuna",
      description: "An open-source chatbot impressing with its conversational abilities",
      url: "https://github.com/lm-sys/FastChat",
      category: "Open LLMs"
    },
    {
      name: "Dolly",
      description: "Databricks' instruction-following LLM",
      url: "https://github.com/databrickslabs/dolly",
      category: "Open LLMs"
    },
    {
      name: "RWKV",
      description: "A RNN with transformer-level LLM performance",
      url: "https://github.com/BlinkDL/RWKV-LM",
      category: "Open LLMs"
    },
    {
      name: "GPT-J",
      description: "Open-source alternative to GPT-3",
      url: "https://github.com/kingoflolz/mesh-transformer-jax",
      category: "Open LLMs"
    },
    {
      name: "GPT-NeoX",
      description: "Large-scale autoregressive language model",
      url: "https://github.com/EleutherAI/gpt-neox",
      category: "Open LLMs"
    },
    {
      name: "Bloom",
      description: "BigScience's open multilingual language model",
      url: "https://huggingface.co/bigscience/bloom",
      category: "Open LLMs"
    },
    {
      name: "Falcon",
      description: "Technology Innovation Institute's language model",
      url: "https://huggingface.co/tiiuae/falcon-40b",
      category: "Open LLMs"
    },
    {
      name: "Baichuan",
      description: "Open-source large language model by Baichuan Intelligent Technology",
      url: "https://github.com/baichuan-inc/Baichuan-13B",
      category: "Open LLMs"
    },
    {
      name: "MOSS",
      description: "Conversational language model by Fudan University",
      url: "https://github.com/OpenLMLab/MOSS",
      category: "Open LLMs"
    },
    {
      name: "RedPajama",
      description: "Open-source recipe to create LLaMA-like models",
      url: "https://github.com/togethercomputer/RedPajama-Data",
      category: "Open LLMs"
    },
    {
      name: "OpenLLaMA",
      description: "Open reproduction of LLaMA by Together",
      url: "https://github.com/openlm-research/open_llama",
      category: "Open LLMs"
    },
    {
      name: "StableLM",
      description: "Stability AI Language Models",
      url: "https://github.com/Stability-AI/StableLM",
      category: "Open LLMs"
    },
    {
      name: "MPT",
      description: "MosaicML's powerful and efficient transformer LLMs",
      url: "https://github.com/mosaicml/llm-foundry",
      category: "Open LLMs"
    },
    {
      name: "OPT",
      description: "Meta's Open Pretrained Transformer language models",
      url: "https://github.com/facebookresearch/metaseq",
      category: "Open LLMs"
    },
    {
      name: "Cerebras-GPT",
      description: "Compute-optimal language models from Cerebras",
      url: "https://huggingface.co/cerebras",
      category: "Open LLMs"
    },
    {
      name: "GLM",
      description: "General Language Model from Tsinghua University",
      url: "https://github.com/THUDM/GLM-130B",
      category: "Open LLMs"
    },
    {
      name: "Galactica",
      description: "Scientific language model by Meta",
      url: "https://github.com/paperswithcode/galai",
      category: "Open LLMs"
    },
    {
      name: "GPT4All",
      description: "Local & private AI running on your CPU",
      url: "https://github.com/nomic-ai/gpt4all",
      category: "Open LLMs"
    },
    {
      name: "OpenChatKit",
      description: "Open source toolkit for building specialized chatbots",
      url: "https://github.com/togethercomputer/OpenChatKit",
      category: "Open LLMs"
    },
    {
      name: "LaMDA",
      description: "Language Model for Dialogue Applications by Google",
      url: "https://blog.google/technology/ai/lamda/",
      category: "Closed LLMs"
    },
    {
      name: "PaLM",
      description: "Pathways Language Model by Google",
      url: "https://ai.googleblog.com/2022/04/pathways-language-model-palm-scaling-to.html",
      category: "Closed LLMs"
    },
    {
      name: "Chinchilla",
      description: "Language model by DeepMind with improved training computation",
      url: "https://arxiv.org/abs/2203.15556",
      category: "Closed LLMs"
    },
    
    // Multimodal models
    {
      name: "GPT-4 Vision",
      description: "OpenAI's multimodal model that can understand images",
      url: "https://openai.com/research/gpt-4v-system-card",
      category: "Multimodal Models"
    },
    {
      name: "DALLE-3",
      description: "OpenAI's latest text-to-image model",
      url: "https://openai.com/dall-e-3",
      category: "Multimodal Models"
    },
    {
      name: "Stable Diffusion",
      description: "Latent text-to-image diffusion model by Stability AI",
      url: "https://github.com/Stability-AI/stablediffusion",
      category: "Multimodal Models"
    },
    {
      name: "Flamingo",
      description: "DeepMind's visual language model",
      url: "https://www.deepmind.com/blog/tackling-multiple-tasks-with-a-single-visual-language-model",
      category: "Multimodal Models"
    },
    {
      name: "CLIP",
      description: "OpenAI's model connecting text and images",
      url: "https://github.com/openai/CLIP",
      category: "Multimodal Models"
    },
    {
      name: "LLaVA",
      description: "Large Language and Vision Assistant",
      url: "https://github.com/haotian-liu/LLaVA",
      category: "Multimodal Models"
    },
    
    // Fine-tuning & RAG
    {
      name: "PEFT",
      description: "Parameter-Efficient Fine-Tuning by Hugging Face",
      url: "https://github.com/huggingface/peft",
      category: "Fine-tuning & RLHF"
    },
    {
      name: "LoRA",
      description: "Low-Rank Adaptation of Large Language Models",
      url: "https://github.com/microsoft/LoRA",
      category: "Fine-tuning & RLHF"
    },
    {
      name: "QLoRA",
      description: "Efficient fine-tuning approach using quantization and LoRA",
      url: "https://github.com/artidoro/qlora",
      category: "Fine-tuning & RLHF"
    },
    {
      name: "Langchain",
      description: "Framework for developing applications powered by language models",
      url: "https://github.com/hwchase17/langchain",
      category: "LLM Applications"
    },
    {
      name: "LlamaIndex",
      description: "Data framework for LLM applications to ingest and learn from data",
      url: "https://github.com/jerryjliu/llama_index",
      category: "LLM Applications"
    },

    // Training & Optimization
    {
      name: "DeepSpeed",
      description: "Microsoft's deep learning optimization library",
      url: "https://github.com/microsoft/DeepSpeed",
      category: "Training & Optimization"
    },
    {
      name: "Megatron-LM",
      description: "NVIDIA's framework for training very large transformer models",
      url: "https://github.com/NVIDIA/Megatron-LM",
      category: "Training & Optimization"
    },
    {
      name: "FSDP",
      description: "PyTorch's Fully Sharded Data Parallel for distributed training",
      url: "https://pytorch.org/docs/stable/fsdp.html",
      category: "Training & Optimization"
    },
    {
      name: "FlashAttention",
      description: "Fast and memory-efficient exact attention",
      url: "https://github.com/HazyResearch/flash-attention",
      category: "Training & Optimization"
    },
    {
      name: "vLLM",
      description: "High-throughput and memory-efficient inference and serving engine",
      url: "https://github.com/vllm-project/vllm",
      category: "Training & Optimization"
    },
    
    // Quantization & Compression
    {
      name: "GPTQ",
      description: "Post-training quantization for generative pre-trained transformers",
      url: "https://github.com/IST-DASLab/gptq",
      category: "Quantization & Compression"
    },
    {
      name: "LLM.int8()",
      description: "8-bit Matrix Multiplication for LLMs",
      url: "https://github.com/TimDettmers/bitsandbytes",
      category: "Quantization & Compression"
    },
    {
      name: "AWQ",
      description: "Activation-aware Weight Quantization",
      url: "https://github.com/mit-han-lab/llm-awq",
      category: "Quantization & Compression"
    },
    {
      name: "SmoothQuant",
      description: "Accurate and efficient post-training quantization for LLMs",
      url: "https://github.com/mit-han-lab/smoothquant",
      category: "Quantization & Compression"
    },
    
    // Evaluation
    {
      name: "MMLU",
      description: "Massive Multitask Language Understanding benchmark",
      url: "https://github.com/hendrycks/test",
      category: "LLM Evaluation"
    },
    {
      name: "HELM",
      description: "Holistic Evaluation of Language Models",
      url: "https://github.com/stanford-crfm/helm",
      category: "LLM Evaluation"
    },
    {
      name: "BIG-bench",
      description: "Beyond the Imitation Game benchmark",
      url: "https://github.com/google/BIG-bench",
      category: "LLM Evaluation"
    },
    {
      name: "OpenLLM Leaderboard",
      description: "Hugging Face's leaderboard for open LLMs",
      url: "https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard",
      category: "LLM Evaluation"
    },
    {
      name: "LMSYS Chatbot Arena",
      description: "Platform for evaluating LLMs through human preferences",
      url: "https://chat.lmsys.org/",
      category: "LLM Evaluation"
    },
  ];

  // Get list of unique categories
  const categories = ['all', ...Array.from(new Set(llmData.map(item => item.category)))];

  // Filter data based on search query and selected category
  const filteredData = llmData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group filtered data by category
  const groupedData: Record<string, LLMEntry[]> = {};
  filteredData.forEach(item => {
    if (!groupedData[item.category]) {
      groupedData[item.category] = [];
    }
    groupedData[item.category].push(item);
  });

  return (
    <div className="max-w-7xl mx-auto">
      <Header title="LLM Library" wallet={wallet} />
      
      {/* Hero Section */}
      <div className="brutalist-card p-8 mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-4 border-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-mono font-bold mb-4">Awesome LLM Collection</h1>
            <p className="text-lg mb-6">
              A comprehensive library of Large Language Models, tools, and resources for AI developers and researchers.
              Based on the <a href="https://github.com/Hannibal046/Awesome-LLM" target="_blank" rel="noopener noreferrer" className="underline">Awesome-LLM</a> GitHub repository.
            </p>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="w-48 h-48 border-4 border-white rounded-full flex items-center justify-center bg-white bg-opacity-20">
              <span className="text-6xl font-bold">LLM</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models, tools, or keywords..."
              className="w-full pl-10 pr-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 font-bold rounded-md border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  selectedCategory === category 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white text-gray-800'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      {Object.keys(groupedData).length > 0 ? (
        Object.entries(groupedData).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-mono font-bold mb-6 border-b-4 border-black pb-2">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <BrutalistCard key={item.name} className="p-6 border-4 border-black h-full flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-gray-600 flex-grow">{item.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline text-sm flex items-center"
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
          <p className="text-gray-600">Try adjusting your search query or filters</p>
        </div>
      )}
      
      {/* Resources Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-mono font-bold mb-6">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BrutalistCard className="p-6 border-4 border-black">
            <h3 className="text-xl font-bold mb-2">Research Papers</h3>
            <p className="text-gray-600 mb-4">
              Stay updated with the latest academic research on LLMs and their applications.
            </p>
            <a 
              href="https://arxiv.org/search/?searchtype=all&query=large+language+models&abstracts=show&size=50&order=-announced_date_first" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-purple-600"
            >
              <span>Explore on arXiv</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </BrutalistCard>
          
          <BrutalistCard className="p-6 border-4 border-black">
            <h3 className="text-xl font-bold mb-2">Hugging Face</h3>
            <p className="text-gray-600 mb-4">
              Access thousands of pre-trained models and datasets for natural language processing.
            </p>
            <a 
              href="https://huggingface.co/models?pipeline_tag=text-generation&sort=downloads" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-purple-600"
            >
              <span>Browse models</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </BrutalistCard>
          
          <BrutalistCard className="p-6 border-4 border-black">
            <h3 className="text-xl font-bold mb-2">Papers With Code</h3>
            <p className="text-gray-600 mb-4">
              Find implementations of state-of-the-art LLM papers with code examples.
            </p>
            <a 
              href="https://paperswithcode.com/task/language-modelling" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-purple-600"
            >
              <span>View implementations</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </BrutalistCard>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-gray-100 border-2 border-gray-300 rounded-md text-sm text-gray-600">
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