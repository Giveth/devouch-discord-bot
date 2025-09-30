import { DeVouchAttestationsResponse } from '../types/devouch-types';
import { DEVOUCH_PROD_URL, DEVOUCH_TARGET_ORGANIZATION, DEVOUCH_PROJECTS_LIMIT } from '../config';

/**
 * Fetches project attestations from the DeVouch API
 * 
 * @param limit Maximum number of attestations to fetch (defaults to env var)
 * @param offset Pagination offset
 * @param organisation_id ID of the organization to filter attestations by (defaults to env var)
 * @returns Promise with the attestation data
 */
export async function getDeVouchAttestations(
  limit = DEVOUCH_PROJECTS_LIMIT,
  offset = 0,
  organisation_id = DEVOUCH_TARGET_ORGANIZATION
): Promise<DeVouchAttestationsResponse> {
  try {
    const query = `
      {
        projectAttestations(
          offset: ${offset},
          limit: ${limit},
          orderBy: attestTimestamp_DESC,
          where: {
            vouch_eq: true,
            project: {
              source_eq: "giveth"
            },
            attestorOrganisation: {
              organisation: {
                id_eq: "${organisation_id}"
              }
            }
          }
        ) {
          attestTimestamp
          project {
            projectId
            title
            url
            attests(
              where: {
                attestorOrganisation: {
                  organisation: {
                    id_eq: "${organisation_id}"
                  }
                }
              }
            ) {
              attestorOrganisation {
                organisation {
                  id
                }
              }
              attestorOrganisation {
                attestor {
                  id
                }
              }
            }
          }
        }
      }`;

    console.log(`Fetching DeVouch attestations with limit: ${limit}, organization: ${organisation_id}`);
    
    const response = await fetch(DEVOUCH_PROD_URL, {
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
    if (!data?.data?.projectAttestations) {
      throw new Error("Invalid response structure from DeVouch API");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("DeVouch API Error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}
