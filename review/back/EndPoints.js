import Request from "./Request.js";
import { getBackendUrl } from "./ConfigReader.js";


export async function searchCompaniesByName(name) {
    const url = `${getBackendUrl}/companies?name=${name}`;
    return await Request(url, 'GET');
}

export async function getCompanyById(id) {
    const url = `${getBackendUrl}/companies/${id}`;
    return await Request(url, 'GET');
}

export async function analyzeCompany(id) {
    const url = `${getBackendUrl}/companies/${id}/analyze`;
    return await Request(url, 'GET');
}

export async function generateCompanyReview(name) {
    const url = `${getBackendUrl}/generate-review`;
    return await Request(url, 'POST', { name });
}

