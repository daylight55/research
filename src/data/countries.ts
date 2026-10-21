import countries from './countries.json'

export const COUNTRIES = countries

export type CountryCode = keyof typeof COUNTRIES
export const COUNTRY_CODES = Object.keys(COUNTRIES) as [CountryCode, ...CountryCode[]]

export function countryTitlePrefix(countries: readonly string[], locale: string) {
	const language = locale === 'ja' ? 'ja' : 'en'
	return countries
		.map((code) => COUNTRIES[code as CountryCode]?.[language] ?? code)
		.join(language === 'ja' ? '・' : ' / ')
}
