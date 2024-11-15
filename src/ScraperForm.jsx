import React, { useState } from "react";

function ScraperForm() {
  const [item, setItem] = useState("");
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setScrapedData(null); // Clear previous data
    try {
      const response = await fetch("http://localhost:5000/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item, pages }),
      });
      const data = await response.json();
      setScrapedData(data); // Save scraped data
    } catch (error) {
      console.error("Error during scraping:", error);
      alert("Failed to scrape data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(scrapedData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${item}_data.json`;
    link.click();
  };

  const downloadCSV = () => {
    if (!scrapedData) return;

    // Convert JSON to CSV
    const headers = Object.keys(scrapedData[0]);
    const rows = scrapedData.map((item) => headers.map((header) => item[header] || "").join(","));
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${item}_data.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Amazon Scraper</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Item to Search:
            </label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="Enter item name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Pages:
            </label>
            <input
              type="number"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="Enter number of pages"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Scrape Data
          </button>
        </form>

        {/* Display loading message */}
        {loading && (
          <p className="text-center text-gray-500 mt-4">Waiting for data scraping...</p>
        )}

        {/* Display download buttons when scraping is complete */}
        {scrapedData && (
          <div className="mt-4 space-y-2">
            <button
              onClick={downloadJSON}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Download JSON
            </button>
            <button
              onClick={downloadCSV}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Download CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScraperForm;
