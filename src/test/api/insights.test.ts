import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/insights/route';

// We need to mock @google/genai before any imports
const generateContentMock = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: generateContentMock
      };
    },
    Type: { OBJECT: 'object', STRING: 'string', ARRAY: 'array', NUMBER: 'number' }
  };
});

// Create a valid mock request body
const validBody = {
  input: {
    region: 'GLOBAL',
    transport: { carKmPerWeek: 100, carFuel: 'petrol', publicTransitKmPerWeek: 0, flightsShortHaulPerYear: 0, flightsLongHaulPerYear: 0 },
    home: { electricityKwhPerMonth: 200, renewablePercent: 0, heatingFuel: 'gas', heatingAmountPerMonth: 100, householdSize: 2 },
    food: { diet: 'medium_meat', foodWaste: 'medium' },
    consumption: { shopping: 'average', recycles: true }
  },
  result: {
    totalKg: 5000,
    totalTonnes: 5,
    categories: { transport: 1000, home: 1000, food: 2000, consumption: 1000 },
    details: { car: 1000, transit: 0, flights: 0, electricity: 500, heating: 500 }
  }
};

describe('POST /api/insights', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
    generateContentMock.mockReset();
    vi.clearAllMocks();
  });

  function createRequest(body: any = validBody) {
    return new NextRequest('http://localhost/api/insights', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  it('test_gemini_failure_falls_back_to_rules', async () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
    process.env.GOOGLE_CLOUD_REGION = 'us-central1';
    
    // Simulate AI failure
    generateContentMock.mockRejectedValue(new Error('AI Service Down'));
    
    const req = createRequest();
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.source).toBe('rules');
    expect(data.recommendations).toBeInstanceOf(Array);
  });

  it('test_empty_gemini_recommendations_fall_back_to_rules', async () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
    process.env.GOOGLE_CLOUD_REGION = 'us-central1';
    
    // Simulate AI returning empty recommendations
    generateContentMock.mockResolvedValue({
      text: JSON.stringify({ summary: 'No tips.', recommendations: [] })
    });
    
    const req = createRequest();
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.source).toBe('rules');
    expect(data.recommendations.length).toBeGreaterThan(0);
  });

  it('test_malformed_gemini_json_falls_back_to_rules', async () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
    process.env.GOOGLE_CLOUD_REGION = 'us-central1';
    
    // Simulate malformed JSON
    generateContentMock.mockResolvedValue({
      text: '{ invalid json '
    });
    
    const req = createRequest();
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.source).toBe('rules');
    expect(data.recommendations).toBeInstanceOf(Array);
  });

  it('test_disabled_gemini_uses_rules', async () => {
    // No GOOGLE_CLOUD_PROJECT
    delete process.env.GOOGLE_CLOUD_PROJECT;
    delete process.env.GOOGLE_CLOUD_REGION;
    
    const req = createRequest();
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.source).toBe('rules');
    expect(generateContentMock).not.toHaveBeenCalled();
  });
});
