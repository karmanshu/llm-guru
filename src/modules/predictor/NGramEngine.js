// NGramEngine.js — Trigram Language Model with Backoff + Laplace Smoothing

const CORPUS = [
  "the cat sat on the mat and looked out the window at the birds flying by",
  "a large language model can generate text by predicting one word at a time",
  "neural networks learn patterns from data through training on large datasets",
  "the dog ran across the park chasing after the ball thrown by the child",
  "machine learning is a branch of artificial intelligence that learns from data",
  "the sun rose over the mountains casting golden light across the valley below",
  "deep learning models use multiple layers of neurons to extract complex features",
  "the cat jumped over the fence and landed softly in the garden outside",
  "natural language processing helps computers understand and generate human language",
  "the rain fell softly on the roof creating a soothing rhythm throughout the night",
  "transformers use attention mechanisms to process all tokens in parallel efficiently",
  "the bird sang a beautiful song from the top of the tall old tree",
  "word embeddings represent words as dense vectors in a continuous space",
  "the child read a book about dinosaurs and dreamed of ancient worlds",
  "language models predict the next word based on the context of previous words",
  "the flowers bloomed in spring filling the garden with color and sweet fragrance",
  "attention allows the model to focus on relevant parts of the input sequence",
  "the teacher explained how the brain works using simple and clear examples",
  "tokenization breaks text into smaller pieces called tokens for the model to process",
  "the moon shone brightly over the calm lake reflecting silver light on water",
  "training a model requires large amounts of compute power and training data",
  "the wind blew through the trees making the leaves dance and rustle softly",
  "reinforcement learning from human feedback helps align models with human values",
  "the student learned about vectors and matrices in the linear algebra class today",
  "positional encoding adds information about word order to the token embeddings",
  "the old man sat on the bench and watched the world go by slowly",
  "context windows determine how much text the model can consider at once",
  "the river flowed gently through the valley carrying leaves and small stones along",
  "pre training teaches the model general language understanding from unlabeled text data",
  "the chef prepared a delicious meal using fresh ingredients from the local market",
  "fine tuning adapts a pre trained model to specific tasks with labeled examples",
  "the stars sparkled in the clear night sky above the quiet sleeping town",
  "temperature controls the randomness of the model output during text generation",
  "the fox jumped over the lazy sleeping dog near the old wooden fence",
  "large language models have billions of parameters that store learned knowledge",
  "the painter created a masterpiece using bold colors and sweeping brush strokes",
  "hallucination occurs when the model generates plausible but incorrect information",
  "the ocean waves crashed against the rocky shore under the grey cloudy sky",
  "top k sampling limits choices to the k most likely next tokens only",
  "the garden was full of roses tulips and daisies swaying gently in the breeze",
];

export class NGramEngine {
  constructor() {
    this.unigrams = {};
    this.bigrams = {};
    this.trigrams = {};
    this.vocab = new Set();
    this.totalUnigrams = 0;
    this.train();
  }

  train() {
    CORPUS.forEach(sentence => {
      const words = sentence.toLowerCase().split(/\s+/);
      words.forEach(w => {
        this.vocab.add(w);
        this.unigrams[w] = (this.unigrams[w] || 0) + 1;
        this.totalUnigrams++;
      });
      for (let i = 0; i < words.length - 1; i++) {
        const key = words[i];
        if (!this.bigrams[key]) this.bigrams[key] = {};
        this.bigrams[key][words[i + 1]] = (this.bigrams[key][words[i + 1]] || 0) + 1;
      }
      for (let i = 0; i < words.length - 2; i++) {
        const key = `${words[i]} ${words[i + 1]}`;
        if (!this.trigrams[key]) this.trigrams[key] = {};
        this.trigrams[key][words[i + 2]] = (this.trigrams[key][words[i + 2]] || 0) + 1;
      }
    });
  }

  predict(inputText, temperature = 0.7, topK = 5) {
    const words = inputText.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return this._topUnigrams(topK, temperature);

    const last = words[words.length - 1];
    const secondLast = words.length >= 2 ? words[words.length - 2] : null;
    const V = this.vocab.size;

    let candidates = {};

    // Trigram
    if (secondLast) {
      const triKey = `${secondLast} ${last}`;
      const triCounts = this.trigrams[triKey];
      if (triCounts) {
        const total = Object.values(triCounts).reduce((a, b) => a + b, 0);
        for (const [w, c] of Object.entries(triCounts)) {
          candidates[w] = (candidates[w] || 0) + ((c + 1) / (total + V)) * 3; // weight trigrams most
        }
      }
    }

    // Bigram backoff
    const biCounts = this.bigrams[last];
    if (biCounts) {
      const total = Object.values(biCounts).reduce((a, b) => a + b, 0);
      for (const [w, c] of Object.entries(biCounts)) {
        candidates[w] = (candidates[w] || 0) + ((c + 1) / (total + V)) * 1.5;
      }
    }

    // Unigram backoff
    for (const [w, c] of Object.entries(this.unigrams)) {
      candidates[w] = (candidates[w] || 0) + ((c + 1) / (this.totalUnigrams + V)) * 0.5;
    }

    return this._applyTemperature(candidates, temperature, topK);
  }

  _topUnigrams(topK, temperature) {
    const V = this.vocab.size;
    const candidates = {};
    for (const [w, c] of Object.entries(this.unigrams)) {
      candidates[w] = (c + 1) / (this.totalUnigrams + V);
    }
    return this._applyTemperature(candidates, temperature, topK);
  }

  _applyTemperature(candidates, temperature, topK) {
    const entries = Object.entries(candidates).sort((a, b) => b[1] - a[1]).slice(0, Math.max(topK * 3, 15));
    const t = Math.max(temperature, 0.01);
    const logProbs = entries.map(([w, p]) => [w, Math.log(Math.max(p, 1e-10)) / t]);
    const maxLog = Math.max(...logProbs.map(x => x[1]));
    const exps = logProbs.map(([w, lp]) => [w, Math.exp(lp - maxLog)]);
    const sum = exps.reduce((s, x) => s + x[1], 0);
    const probs = exps.map(([w, e]) => ({ word: w, prob: e / sum }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, topK);

    // Pick a "winner" via weighted random
    const r = Math.random();
    let cumul = 0;
    let winnerIdx = 0;
    for (let i = 0; i < probs.length; i++) {
      cumul += probs[i].prob;
      if (r <= cumul) { winnerIdx = i; break; }
    }
    probs[winnerIdx].isWinner = true;

    return probs;
  }
}
