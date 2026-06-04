export const FIELD_OF_STUDY_OTHER_VALUE = '__other__';

export function usesFieldOfStudyList(occupation, selectOccupations = []) {
    return selectOccupations.includes(occupation);
}

export function splitFieldOfStudyValue(occupation, fieldOfStudy, options = [], selectOccupations = []) {
    const normalizedFieldOfStudy = typeof fieldOfStudy === 'string' ? fieldOfStudy.trim() : '';

    if (!usesFieldOfStudyList(occupation, selectOccupations)) {
        return {
            field_of_study: normalizedFieldOfStudy,
            field_of_study_other: '',
        };
    }

    if (!normalizedFieldOfStudy) {
        return {
            field_of_study: '',
            field_of_study_other: '',
        };
    }

    if (options.includes(normalizedFieldOfStudy)) {
        return {
            field_of_study: normalizedFieldOfStudy,
            field_of_study_other: '',
        };
    }

    return {
        field_of_study: FIELD_OF_STUDY_OTHER_VALUE,
        field_of_study_other: normalizedFieldOfStudy,
    };
}
