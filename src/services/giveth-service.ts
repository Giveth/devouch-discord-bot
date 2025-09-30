import { ProjectByIdResponse } from '../types/giveth-types';
import { GIVETH_PROD_URL } from '../config';

/**
 * Fetches project details from the Giveth API by project ID
 * 
 * @param projectId The ID of the project to fetch
 * @returns Promise with the project data
 */
export async function getProjectById(
  projectId: number
): Promise<ProjectByIdResponse> {
  try {
    const query = `query {
      projectById(id: ${projectId}) {
        id
        title
        slug
        description
        verified
        socialMedia{
          link
          type
        }
        status{
          id
          symbol
          name
          description
        }
      }
    }`;

    
    const response = await fetch(GIVETH_PROD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.errors?.[0]?.message ||
        errorData?.message ||
        `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();

    // Validate that the response has the expected structure
    if (!data?.data?.projectById) {
      throw new Error("Invalid response structure from Giveth API");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Giveth API Error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}
