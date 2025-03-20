// Use dynamic import() to load the ESM module
import("@xenova/transformers")
  .then(async ({ pipeline }) => {
    const clustering = require("density-clustering");
    const { kmeans } = require("ml-kmeans");

    // Example dataset
    const data = [
      "Apple iPhone 12",
      "iPhone 12 64GB",
      "iPhone twelve",
      "Samsung Galaxy S21",
      "Galaxy S21 Ultra",
      "S21 5G",
    ];

    // Text preprocessing
    function preprocess(text) {
      text = text.toLowerCase(); // Convert to lowercase
      text = text.replace(/[^\w\s]/g, ""); // Remove special characters
      return text.trim(); // Trim whitespace
    }

    const cleanedData = data.map(preprocess);
    console.log("Cleaned Data:", cleanedData);

    // Generate embeddings using Sentence-BERT
    async function generateEmbeddings(texts) {
      // Load the Sentence-BERT model
      const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      );

      // Generate embeddings for each text
      const embeddings = await Promise.all(
        texts.map(async (text) => {
          const output = await extractor(text, {
            pooling: "mean",
            normalize: true,
          });
          return Array.from(output.data); // Convert Float32Array to regular array
        }),
      );
      return embeddings;
    }

    // Perform clustering
    async function main() {
      // Step 1: Generate embeddings
      const embeddings = await generateEmbeddings(cleanedData);
      console.log("Embeddings:", embeddings);
      const dbscan = new clustering.DBSCAN();
      // Step 2: Perform k-means clustering
      const numClusters = 3; // Adjust based on your data
      const { clusters } = kmeans(embeddings, numClusters);

      // Step 3: Add clusters to the data
      const result = data.map((name, index) => ({
        product_name: name,
        cluster: clusters[index],
      }));

      console.log("Clustering Result:", result);
    }

    // Run the script
    main().catch((err) => console.error("Error:", err));
  })
  .catch((err) => console.error("Failed to load @xenova/transformers:", err));
