import Request from "./Request";
import ApiAddress from "./Variables";


export async function searchCompaniesByName(name) {
    const url = `${ApiAddress}/companies?name=${name}`;
    return await Request(url, 'GET');
}

export async function getCompanyById(id) {
    const url = `${ApiAddress}/companies/${id}`;
    return await Request(url, 'GET');
}

export async function analyzeCompany(id) {
    const url = `${ApiAddress}/companies/${id}/analyze`;
    return await Request(url, 'GET');
}

export async function generateCompanyReview(name) {
    const url = `${ApiAddress}/generate-review`;
    return await Request(url, 'POST', { name });
}

