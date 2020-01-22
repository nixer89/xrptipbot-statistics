export function dateToStringForLocale(dateToFormat: Date): string {
    return dateToFormat.toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale);
}

export function dateToStringEuropeForLocale(dateToFormat: Date): string {
    return dateToFormat.toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale, {timeZone: 'Europe/Berlin'} );
}

export function dateToStringEuropeForAPI(dateToFormat: Date): string {
    return dateToFormat.toUTCString();
}

export function initializeDateAsGMT1(date: Date): Date {    
    return new Date(date.toUTCString() + '+0100');
}

export function initializeStringDateAsGMT1(date: string): Date {    
    return new Date(new Date(date).toUTCString() + '+0100');
}
