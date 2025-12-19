# API Usage Examples

Contoh penggunaan API untuk berbagai bahasa pemrograman dan framework.

## Table of Contents

- [JavaScript/TypeScript](#javascripttypescript)
- [Python](#python)
- [PHP](#php)
- [Ruby](#ruby)
- [Go](#go)
- [Java](#java)
- [C#](#c)
- [React](#react)
- [Vue.js](#vuejs)
- [Next.js](#nextjs)

---

## JavaScript/TypeScript

### Basic Fetch

```typescript
async function generateImage(imageUrl: string, enhancement: string) {
  const response = await fetch('https://[project-id].supabase.co/functions/v1/api-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY!
    },
    body: JSON.stringify({
      imageUrl,
      enhancement,
      classification: 'clothing'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

// Usage
try {
  const result = await generateImage(
    'https://example.com/product.jpg',
    'add_female_model'
  );
  console.log('Generated:', result.generatedImageUrl);
} catch (error) {
  console.error('Error:', error.message);
}
```

### With Retry Logic

```typescript
async function generateImageWithRetry(
  imageUrl: string, 
  enhancement: string,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('https://[project-id].supabase.co/functions/v1/api-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY!
        },
        body: JSON.stringify({ imageUrl, enhancement })
      });

      if (response.status === 429) {
        // Rate limit - wait and retry
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

---

## Python

### Using Requests

```python
import requests
import time
from typing import Optional

class ImageGenerator:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'x-api-key': api_key
        }
    
    def generate(
        self, 
        image_url: str, 
        enhancement: str,
        classification: Optional[str] = None,
        watermark: Optional[dict] = None
    ) -> dict:
        payload = {
            'imageUrl': image_url,
            'enhancement': enhancement
        }
        
        if classification:
            payload['classification'] = classification
        
        if watermark:
            payload['watermark'] = watermark
        
        response = requests.post(
            f'{self.base_url}/api-generate',
            json=payload,
            headers=self.headers
        )
        
        response.raise_for_status()
        return response.json()
    
    def generate_with_retry(
        self,
        image_url: str,
        enhancement: str,
        max_retries: int = 3
    ) -> dict:
        for attempt in range(max_retries):
            try:
                return self.generate(image_url, enhancement)
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 429:
                    # Rate limit - exponential backoff
                    wait_time = (2 ** attempt)
                    time.sleep(wait_time)
                    continue
                raise
        
        raise Exception('Max retries exceeded')

# Usage
generator = ImageGenerator(
    api_key='eak_your_api_key',
    base_url='https://[project-id].supabase.co/functions/v1'
)

try:
    result = generator.generate(
        image_url='https://example.com/product.jpg',
        enhancement='add_female_model',
        classification='clothing',
        watermark={'type': 'text', 'text': 'My Brand'}
    )
    print(f"Generated: {result['generatedImageUrl']}")
except Exception as e:
    print(f"Error: {e}")
```

### Async with aiohttp

```python
import aiohttp
import asyncio

async def generate_image(session, image_url, enhancement):
    url = 'https://[project-id].supabase.co/functions/v1/api-generate'
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': 'eak_your_api_key'
    }
    payload = {
        'imageUrl': image_url,
        'enhancement': enhancement
    }
    
    async with session.post(url, json=payload, headers=headers) as response:
        if response.status != 200:
            error = await response.json()
            raise Exception(error['error'])
        return await response.json()

async def generate_batch(image_urls, enhancement):
    async with aiohttp.ClientSession() as session:
        tasks = [
            generate_image(session, url, enhancement)
            for url in image_urls
        ]
        return await asyncio.gather(*tasks)

# Usage
image_urls = [
    'https://example.com/product1.jpg',
    'https://example.com/product2.jpg',
    'https://example.com/product3.jpg'
]

results = asyncio.run(generate_batch(image_urls, 'add_female_model'))
for result in results:
    print(result['generatedImageUrl'])
```

---

## PHP

### Basic cURL

```php
<?php

class ImageGenerator {
    private $apiKey;
    private $baseUrl;
    
    public function __construct($apiKey, $baseUrl) {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }
    
    public function generate($imageUrl, $enhancement, $options = []) {
        $data = array_merge([
            'imageUrl' => $imageUrl,
            'enhancement' => $enhancement
        ], $options);
        
        $ch = curl_init($this->baseUrl . '/api-generate');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'x-api-key: ' . $this->apiKey
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            $error = json_decode($response, true);
            throw new Exception($error['error'] ?? 'Unknown error');
        }
        
        return json_decode($response, true);
    }
    
    public function generateWithRetry($imageUrl, $enhancement, $maxRetries = 3) {
        for ($i = 0; $i < $maxRetries; $i++) {
            try {
                return $this->generate($imageUrl, $enhancement);
            } catch (Exception $e) {
                if ($i === $maxRetries - 1) {
                    throw $e;
                }
                sleep(pow(2, $i)); // Exponential backoff
            }
        }
    }
}

// Usage
$generator = new ImageGenerator(
    'eak_your_api_key',
    'https://[project-id].supabase.co/functions/v1'
);

try {
    $result = $generator->generate(
        'https://example.com/product.jpg',
        'add_female_model',
        [
            'classification' => 'clothing',
            'watermark' => [
                'type' => 'text',
                'text' => 'My Brand'
            ]
        ]
    );
    
    echo "Generated: " . $result['generatedImageUrl'] . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

---

## Ruby

```ruby
require 'net/http'
require 'json'
require 'uri'

class ImageGenerator
  def initialize(api_key, base_url)
    @api_key = api_key
    @base_url = base_url
  end
  
  def generate(image_url, enhancement, options = {})
    uri = URI("#{@base_url}/api-generate")
    
    payload = {
      imageUrl: image_url,
      enhancement: enhancement
    }.merge(options)
    
    request = Net::HTTP::Post.new(uri)
    request['Content-Type'] = 'application/json'
    request['x-api-key'] = @api_key
    request.body = payload.to_json
    
    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(request)
    end
    
    raise "Error: #{response.body}" unless response.is_a?(Net::HTTPSuccess)
    
    JSON.parse(response.body)
  end
  
  def generate_with_retry(image_url, enhancement, max_retries = 3)
    max_retries.times do |i|
      begin
        return generate(image_url, enhancement)
      rescue => e
        raise e if i == max_retries - 1
        sleep(2 ** i) # Exponential backoff
      end
    end
  end
end

# Usage
generator = ImageGenerator.new(
  'eak_your_api_key',
  'https://[project-id].supabase.co/functions/v1'
)

begin
  result = generator.generate(
    'https://example.com/product.jpg',
    'add_female_model',
    classification: 'clothing'
  )
  
  puts "Generated: #{result['generatedImageUrl']}"
rescue => e
  puts "Error: #{e.message}"
end
```

---

## Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
)

type GenerateRequest struct {
    ImageURL       string                 `json:"imageUrl"`
    Enhancement    string                 `json:"enhancement"`
    Classification string                 `json:"classification,omitempty"`
    Watermark      map[string]interface{} `json:"watermark,omitempty"`
}

type GenerateResponse struct {
    Success           bool   `json:"success"`
    GeneratedImageURL string `json:"generatedImageUrl"`
    Prompt            string `json:"prompt"`
    TaskID            string `json:"taskId"`
}

type ImageGenerator struct {
    apiKey  string
    baseURL string
    client  *http.Client
}

func NewImageGenerator(apiKey, baseURL string) *ImageGenerator {
    return &ImageGenerator{
        apiKey:  apiKey,
        baseURL: baseURL,
        client:  &http.Client{Timeout: 120 * time.Second},
    }
}

func (g *ImageGenerator) Generate(req GenerateRequest) (*GenerateResponse, error) {
    jsonData, err := json.Marshal(req)
    if err != nil {
        return nil, err
    }

    httpReq, err := http.NewRequest(
        "POST",
        g.baseURL+"/api-generate",
        bytes.NewBuffer(jsonData),
    )
    if err != nil {
        return nil, err
    }

    httpReq.Header.Set("Content-Type", "application/json")
    httpReq.Header.Set("x-api-key", g.apiKey)

    resp, err := g.client.Do(httpReq)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API error: %s", string(body))
    }

    var result GenerateResponse
    if err := json.Unmarshal(body, &result); err != nil {
        return nil, err
    }

    return &result, nil
}

func main() {
    generator := NewImageGenerator(
        "eak_your_api_key",
        "https://[project-id].supabase.co/functions/v1",
    )

    result, err := generator.Generate(GenerateRequest{
        ImageURL:       "https://example.com/product.jpg",
        Enhancement:    "add_female_model",
        Classification: "clothing",
    })

    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }

    fmt.Printf("Generated: %s\n", result.GeneratedImageURL)
}
```

---

## React

```tsx
import { useState } from 'react';

interface GenerateOptions {
  imageUrl: string;
  enhancement: string;
  classification?: string;
  watermark?: {
    type: 'none' | 'text' | 'logo';
    text?: string;
    logoUrl?: string;
  };
}

function useImageGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (options: GenerateOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/api-generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_API_KEY!,
          },
          body: JSON.stringify(options),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      return data.generatedImageUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}

// Component usage
function ImageEnhancer() {
  const { generate, loading, error } = useImageGenerator();
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      const url = await generate({
        imageUrl: 'https://example.com/product.jpg',
        enhancement: 'add_female_model',
        classification: 'clothing',
      });
      setResult(url);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {error && <p className="error">{error}</p>}
      {result && <img src={result} alt="Generated" />}
    </div>
  );
}
```

---

## Next.js

### API Route

```typescript
// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/api-generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY!,
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Client Component

```typescript
// app/components/ImageGenerator.tsx
'use client';

import { useState } from 'react';

export default function ImageGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://example.com/product.jpg',
          enhancement: 'add_female_model',
        }),
      });

      const data = await response.json();
      setResult(data.generatedImageUrl);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {result && <img src={result} alt="Generated" />}
    </div>
  );
}
```

---

## Tips & Best Practices

1. **Environment Variables**: Selalu simpan API key di environment variables, jangan hardcode
2. **Error Handling**: Implementasikan proper error handling untuk semua status codes
3. **Retry Logic**: Gunakan exponential backoff untuk retry pada rate limit errors
4. **Caching**: Cache hasil generation untuk menghindari duplicate requests
5. **Monitoring**: Log semua API calls untuk monitoring dan debugging
6. **Security**: Jangan expose API key di client-side code
7. **Batch Processing**: Untuk multiple images, gunakan queue system
8. **Timeout**: Set reasonable timeout untuk long-running operations
