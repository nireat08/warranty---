export default async function handler(req, res) {
  const GAS_URL = process.env.GAS_URL;
  const API_TOKEN = process.env.API_TOKEN;

  try {
    const url = new URL(GAS_URL);
    url.searchParams.append('token', API_TOKEN);

    if (req.method === 'GET') {
      for (const [key, value] of Object.entries(req.query)) {
        url.searchParams.append(key, value);
      }
    }

    const options = {
      method: req.method,
    };

    // [수정된 부분] POST 요청 시 이중 Stringify(포장) 방지
    if (req.method === 'POST') {
      // req.body가 이미 문자열이면 그대로 쓰고, 객체면 JSON 문자열로 변환합니다.
      options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      
      options.headers = {
        'Content-Type': 'application/json',
      };
    }

    const response = await fetch(url.toString(), options);
    const data = await response.json();

    res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ result: "error", message: "서버 통신 중 오류가 발생했습니다." });
  }
}