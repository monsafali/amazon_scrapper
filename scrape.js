
import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/scrape", async (req, res) => {
  const { item, pages } = req.body;
  if (!item || !pages) {
    return res.status(400).json({ error: "Item and page count are required" });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const baseUrl = `https://www.amazon.com/s?k=${encodeURIComponent(item)}&page=`;

  const allData = [];

  try {
    for (let currentPage = 1; currentPage <= parseInt(pages); currentPage++) {
      const url = `${baseUrl}${currentPage}`;
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded" });

      await page.waitForSelector('[data-component-type="s-search-result"]', {
        timeout: 10000,
      });

      const data = await page.evaluate(() => {
        const products = document.querySelectorAll(
          '[data-component-type="s-search-result"]'
        );
        return Array.from(products).map((product) => {
          const name = product.querySelector("h2 a span")?.textContent.trim();
          const priceWhole = product.querySelector(".a-price-whole")
            ?.textContent.trim()
            .replace(",", "");
          const priceFraction = product.querySelector(".a-price-fraction")
            ?.textContent.trim();
          const price =
            priceWhole && priceFraction
              ? `${priceWhole}.${priceFraction}`
              : null;

          return { name, price };
        });
      });

      allData.push(...data);
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
    }
    res.json(allData);
  } catch (error) {
    console.error("Error scraping:", error);
    res.status(500).json({ error: "Scraping failed" });
  } finally {
    await browser.close();
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
