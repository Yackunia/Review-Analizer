export default async function Request(endpoint, method = 'GET', data = null) {
    const config = {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    if (data && !['GET', 'HEAD'].includes(method.toUpperCase())) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(endpoint, config);

        console.log(response);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Expected JSON, got: ${text.slice(0, 100)}...`);
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}