export const ORGANIZATION_OTHER_VALUE = '__other__';

export function usesOrganizationList(occupation, selectOccupations = []) {
    return selectOccupations.includes(occupation);
}

export function splitOrganizationValue(occupation, organization, options = [], selectOccupations = []) {
    const normalizedOrganization = typeof organization === 'string' ? organization.trim() : '';

    if (!usesOrganizationList(occupation, selectOccupations)) {
        return {
            organization: normalizedOrganization,
            organization_other: '',
        };
    }

    if (!normalizedOrganization) {
        return {
            organization: '',
            organization_other: '',
        };
    }

    if (options.includes(normalizedOrganization)) {
        return {
            organization: normalizedOrganization,
            organization_other: '',
        };
    }

    return {
        organization: ORGANIZATION_OTHER_VALUE,
        organization_other: normalizedOrganization,
    };
}