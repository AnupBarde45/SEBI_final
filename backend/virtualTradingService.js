// virtualTradingService.js
const axios = require('axios'); // Still needed for AI Guru's web scraping, but not for getStockPrice
const NodeCache = require('node-cache'); // Our local, in-memory cache

console.log('[VIRTUAL_TRADING_DEBUG] virtualTradingService.js is loading...'); // Debug log

// --- Configuration ---
const MARKET_DATA_CACHE_TTL = 60; // Cache mock data for 60 seconds (to simulate real-world delay)
const INITIAL_VIRTUAL_BALANCE = 100000; // Starting virtual cash balance for new users
const BASE_STOCK_PRICE = 1500; // Base price for mock stocks
const PRICE_FLUCTUATION = 100; // Max fluctuation (e.g., +/- 100 from base price)

// --- Local Cache for Market Data ---
const marketDataCache = new NodeCache({ stdTTL: MARKET_DATA_CACHE_TTL });

// --- Helper for Exponential Backoff (Crucial for External API Calls like Gemini) ---
async function callExternalApiWithBackoff(apiCall, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            if (error.response && error.response.status === 429 && i < retries - 1) { // Too Many Requests
                console.warn(`[VIRTUAL_TRADING] External API call failed (status 429), retrying in ${delay / 1000}s...`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential backoff
            } else {
                throw error; // Re-throw other errors or last retry's 429
            }
        }
    }
}

// --- Function to Get Mock Stock Price ---
// This function now generates a random price instead of fetching from an external API.
async function getStockPrice(symbol) {
    const cachedPrice = marketDataCache.get(symbol);
    if (cachedPrice) {
        console.log(`[VIRTUAL_TRADING] Using cached mock price for ${symbol}`);
        return cachedPrice;
    }

    // Simulate fetching a price: generate a random, realistic-looking price
    const randomFluctuation = (Math.random() * PRICE_FLUCTUATION * 2) - PRICE_FLUCTUATION; // Generates a number between -PRICE_FLUCTUATION and +PRICE_FLUCTUATION
    const mockPrice = BASE_STOCK_PRICE + randomFluctuation;
    const finalPrice = parseFloat(mockPrice.toFixed(2)); // Keep it to 2 decimal places

    marketDataCache.set(symbol, finalPrice); // Cache the mock price
    console.log(`[VIRTUAL_TRADING] Generated mock price for ${symbol}: ₹${finalPrice.toFixed(2)}`);
    return finalPrice;
}

// --- Virtual Trading Logic ---
async function executeVirtualTrade(userId, symbol, quantity, type, currentPortfolio) {
    if (quantity <= 0) {
        throw new Error('Quantity must be positive.');
    }

    const price = await getStockPrice(symbol); // Get the mock price
    const tradeValue = price * quantity;

    let newBalance = currentPortfolio.balance;
    let newHoldings = { ...currentPortfolio.holdings }; // Copy existing holdings

    if (type === 'BUY') {
        if (newBalance < tradeValue) {
            throw new Error(`Insufficient virtual balance. Need ₹${tradeValue.toFixed(2)}, have ₹${newBalance.toFixed(2)}.`);
        }
        newBalance -= tradeValue;
        newHoldings[symbol] = newHoldings[symbol] || { quantity: 0, averagePrice: 0 };

        const existingTotalValue = newHoldings[symbol].quantity * newHoldings[symbol].averagePrice;
        const newTotalValue = existingTotalValue + tradeValue;
        const newTotalQuantity = newHoldings[symbol].quantity + quantity;

        newHoldings[symbol].quantity = newTotalQuantity;
        newHoldings[symbol].averagePrice = newTotalQuantity > 0 ? newTotalValue / newTotalQuantity : 0;

        console.log(`[VIRTUAL_TRADING] User ${userId} BUY ${quantity} of ${symbol} at ₹${price.toFixed(2)}`);

    } else if (type === 'SELL') {
        if (!newHoldings[symbol] || newHoldings[symbol].quantity < quantity) {
            throw new Error(`Insufficient shares of ${symbol} to sell. Have ${newHoldings[symbol]?.quantity || 0}.`);
        }
        newBalance += tradeValue;
        newHoldings[symbol].quantity -= quantity;

        if (newHoldings[symbol].quantity === 0) {
            delete newHoldings[symbol]; // Remove if quantity is zero
        }
        console.log(`[VIRTUAL_TRADING] User ${userId} SELL ${quantity} of ${symbol} at ₹${price.toFixed(2)}`);

    } else {
        throw new Error('Invalid trade type. Must be BUY or SELL.');
    }

    return {
        newBalance: parseFloat(newBalance.toFixed(2)), // Ensure consistent precision
        newHoldings: newHoldings,
        tradeDetails: {
            symbol,
            quantity,
            price: parseFloat(price.toFixed(2)),
            type,
            timestamp: Date.now(),
            value: parseFloat(tradeValue.toFixed(2))
        }
    };
}

console.log('[VIRTUAL_TRADING_DEBUG] virtualTradingService.js finished loading and exporting.'); // Debug log

// --- Export Functions ---
module.exports = {
    getStockPrice,
    executeVirtualTrade,
    INITIAL_VIRTUAL_BALANCE
};