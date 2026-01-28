import axios from 'axios';
import ExchangeRate from '../models/ExchangeRate.js';

const FIXER_API = 'https://data.fixer.io/api/latest';

// In-memory cache to prevent concurrent API calls
let inFlightRequest = null;
let cachedRateInMemory = null;
let cachedRateTimeInMemory = null;

/**
 * Get the current USD to AUD exchange rate
 * Caches the rate and only updates once per day
 */
export const getUSDtoAUDRate = async () => {
  try {
    // Check in-memory cache first (prevents concurrent API calls within same process)
    if (cachedRateInMemory && cachedRateTimeInMemory) {
      const minutesSinceMemoryCache = (Date.now() - cachedRateTimeInMemory) / (1000 * 60);
      if (minutesSinceMemoryCache < 60) { // 1 hour in-memory TTL
        return cachedRateInMemory;
      }
    }

    // If a request is already in flight, wait for it instead of making another
    if (inFlightRequest) {
      return inFlightRequest;
    }

    // Check if we have a cached rate from today
    const cachedRate = await ExchangeRate.findOne({
      from_currency: 'USD',
      to_currency: 'AUD'
    });

    const now = new Date();
    const hoursSinceUpdate = cachedRate 
      ? (now - new Date(cachedRate.last_updated)) / (1000 * 60 * 60)
      : null;

    // Use cache if it's less than 24 hours old
    if (cachedRate && hoursSinceUpdate < 24) {
      cachedRateInMemory = cachedRate.rate;
      cachedRateTimeInMemory = Date.now();
      return cachedRate.rate;
    }

    // Create in-flight request promise
    inFlightRequest = (async () => {
      // Fetch fresh rate from fixer.io
      console.log('🔄 Fetching fresh USD->AUD exchange rate from fixer.io...');
      const response = await axios.get(FIXER_API, {
        params: {
          access_key: process.env.FIXER_API_KEY,
          symbols: 'USD,AUD',
          format: 1
        }
      });

      if (!response.data.rates || !response.data.rates.USD || !response.data.rates.AUD) {
        throw new Error('Invalid response from fixer.io API');
      }

      // Calculate USD:AUD rate (AUD rate / USD rate)
      const usdRate = response.data.rates.USD;
      const audRate = response.data.rates.AUD;
      const conversionRate = audRate / usdRate;

      console.log(`✅ Fetched exchange rates - USD: ${usdRate}, AUD: ${audRate}`);
      console.log(`💱 Calculated USD->AUD rate: ${conversionRate.toFixed(4)}`);

      // Update or create the cached rate
      await ExchangeRate.findOneAndUpdate(
        {
          from_currency: 'USD',
          to_currency: 'AUD'
        },
        {
          rate: conversionRate,
          last_updated: now
        },
        {
          upsert: true,
          new: true
        }
      );

      // Cache in memory
      cachedRateInMemory = conversionRate;
      cachedRateTimeInMemory = Date.now();

      return conversionRate;
    })();

    // Wait for the in-flight request and clear it when done
    const result = await inFlightRequest;
    inFlightRequest = null;
    return result;
  } catch (error) {
    inFlightRequest = null; // Clear in-flight request on error
    console.error('❌ Error fetching exchange rate:', error.message);
    
    // If API fails, try to use cached rate regardless of age
    const cachedRate = await ExchangeRate.findOne({
      from_currency: 'USD',
      to_currency: 'AUD'
    });

    if (cachedRate) {
      console.log(`⚠️  Using stale cached rate due to API error: ${cachedRate.rate.toFixed(4)}`);
      cachedRateInMemory = cachedRate.rate;
      cachedRateTimeInMemory = Date.now();
      return cachedRate.rate;
    }

    // Fallback to approximate rate if no cache available
    console.log('⚠️  No cached rate available, using approximate rate');
    return 1.5; // Approximate USD to AUD rate
  }
};

/**
 * Convert USD price to AUD
 */
export const convertUSDtoAUD = async (priceUSD) => {
  const rate = await getUSDtoAUDRate();
  return priceUSD * rate;
};

/**
 * Format price display as "X.XX AUD (Y.YY USD)"
 */
export const formatPriceWithCurrency = async (priceUSD) => {
  const priceAUD = await convertUSDtoAUD(priceUSD);
  return `$${priceAUD.toFixed(2)} AUD ($${priceUSD.toFixed(2)} USD)`;
};
