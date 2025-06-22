import Request from "./Request.js";
import { getBackendUrl } from "./ConfigReader.js";


export async function searchCompaniesByName(name) {
    console.log("33333");
    const url = `/api/companies?name=${name}`;
    return await Request(url, 'GET');
}

export async function getCompanyById(id) {
    const backendUrl = await getBackendUrl();
    const url = `/api/companies/${id}`;
    return await Request(url, 'GET');
}

export async function analyzeCompany(id) {
    const backendUrl = await getBackendUrl();
    const url = `${backendUrl}/api/companies/${id}/analyze`;
    return await Request(url, 'GET');
}

export async function generateCompanyReview(name) {
    const backendUrl = await getBackendUrl();
    const url = `${backendUrl}/api/generate-review`;
    return await Request(url, 'POST', { name });
}

