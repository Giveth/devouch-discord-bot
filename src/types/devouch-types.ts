export interface DeVouchAttestationsResponse {
  data: {
    projectAttestations: ProjectAttestation[];
  };
}

export interface ProjectAttestation {
  attestTimestamp: string;
  project: {
    projectId: string;
    title: string;
    url: string;
    attests: Attest[];
  };
}

export interface Attest {
  attestorOrganisation: {
    organisation: {
      id: string;
    };
    attestor: {
      id: string;
    };
  };
}
