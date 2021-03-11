import { Record as R } from './types/records'
import { Remote } from './types/remote'
import { Mapping } from './types/mappings'
import { tables } from './tables'
import { formatCellValue } from './fields'

declare const APIKEY: string

export const remote = (function () {
	const url = 'https://api.airtable.com/'
	const userAgent = 'Airtable.js/0.8.1'
	const airtableVersion = '0'

	function makeHeaders(baseId?: string): Headers {
		const headers = new Headers()
		headers.append('Accept', 'application/json')
		headers.append('Content-Type', 'application/json')
		headers.append('authorization', 'Bearer ' + APIKEY)
		headers.append('x-airtable-user-agent', userAgent)
		baseId && headers.append('x-airtable-application-id', baseId)
		return headers
	}

	function formatQueryParameters(params: {
		[label: string]: string | string[]
	}): string {
		return Object.entries(params || {})
			.map(([label, values]) =>
				Array.isArray(values)
					? values.map((value) =>
							formatQueryParameters({ [label]: value })
					  )
					: `${label}=${encodeURIComponent(values)}`
			)
			.join('&')
	}

	async function makeFetchRequest(args: {
		path: string
		method: Remote.Methods
		baseId?: string
		payload?: (R.LockedRecordFields | R.UpdateRecord)[]
	}): Promise<Remote.Response> {
		const { path, method, baseId, payload } = args
		if ((method === 'GET' || method === 'DELETE') && payload) {
			throw new Error(
				`GET / DELETE requests can not have a request body.`
			)
		}
		const response = await fetch(`${url}v${airtableVersion}/${path}`, {
			headers: makeHeaders(baseId),
			method,
			body: payload ? JSON.stringify(payload) : null,
		})
		if (response.ok) {
			const results = (await response.json()) as Remote.Response
			return results || { records: [] }
		} else {
			throw new Error(
				`Remote fetch request failed with message "${response.statusText}" and code ${response.status}`
			)
		}
	}

	async function throttleRemoteRequest(args: {
		network: {
			path: string
			method: Remote.Methods
			baseId?: string
		}
		records: R.LockedRecordFields[] | R.UpdateRecord[]
	}): Promise<Remote.CreateOrUpdateResponse[]> {
		const { records, network } = args
		const results: Remote.CreateOrUpdateResponse[] = []
		let index = 0
		while (index < records.length) {
			const round = records.slice(index, 10)
			const result = (await makeFetchRequest({
				...network,
				payload: round,
			})) as { records: Remote.CreateOrUpdateResponse[] }
			results.push(...result.records)
			index = index + 10
		}
		return results
	}

	return {
		selectRecords: async function (args: {
			baseId: string
			tableId: string
			query?: {
				view?: string
				fields?: string[]
				filterByFormula?: string
			}
		}): Promise<Remote.CreateOrUpdateResponse[]> {
			const { baseId, tableId, query } = args
			const queryParams = formatQueryParameters(query || {})
			const results: Remote.CreateOrUpdateResponse[] = []
			let offset = ''
			while (offset !== null) {
				const result = (await makeFetchRequest({
					path: `${baseId}/${tableId}?${queryParams}${
						offset ? '&offset=' + offset : ''
					}`,
					method: 'GET',
					baseId,
				})) as Remote.ListRecordsResponse
				results.push(...result.records)
				offset = result.offset || null
			}
			return results
		},
		convertFieldsToNames: function <
			T extends { [index: string]: R.CutomField }
		>(args: {
			tableId: string
			records: Remote.CreateOrUpdateResponse[]
			mappings: { [refName: string]: Mapping.ViewMapping }
		}): R.Record<T>[] {
			const { tableId, records, mappings } = args
			if (!records || !records.length) return []
			const mappingsForTable = tables.getMappingsForTable({
				table: tableId,
				mappings,
			})
			const fieldMappings = tables.getMappingsForViews({
				viewMappings: mappingsForTable,
			})
			return records.map((record) => {
				const fields: { [index: string]: R.CutomField } = {}
				Object.entries(fieldMappings).forEach(([key, field]) => {
					const fieldValue: unknown = record.fields[field.name]
					if (fieldValue === null || fieldValue === undefined) {
						fields[key] = null
					} else {
						fields[key] = formatCellValue(field, fieldValue)
					}
				})
				return {
					id: record.id,
					name: Object.values(record.fields).find(
						(value) => typeof value === 'string'
					) as string,
					tableId,
					fields: fields as T,
				}
			})
		},
		createRecords: async function (args: {
			baseId: string
			tableId: string
			records: R.LockedRecordFields[]
		}): Promise<Remote.CreateOrUpdateResponse[]> {
			const { baseId, tableId, records } = args
			return await throttleRemoteRequest({
				network: {
					path: `${baseId}/${tableId}`,
					method: 'POST',
					baseId,
				},
				records,
			})
		},
		updateRecords: async function (args: {
			baseId: string
			tableId: string
			records: R.UpdateRecord[]
		}): Promise<Remote.CreateOrUpdateResponse[]> {
			const { baseId, tableId, records } = args
			return await throttleRemoteRequest({
				network: {
					path: `${baseId}/${tableId}`,
					method: 'PATCH',
					baseId,
				},
				records,
			})
		},
		deleteRecords: async function (args: {
			baseId: string
			tableId: string
			recordIds: string[]
		}): Promise<Remote.DeleteResponce[]> {
			const { baseId, tableId, recordIds } = args
			const results: Remote.DeleteResponce[] = []
			let index = 0
			while (index < recordIds.length) {
				const round = recordIds.slice(index, 10)
				const result = (await makeFetchRequest({
					path: `${baseId}/${tableId}?${round.map(
						(id) => `records[]=${id}&`
					)}`,
					method: 'DELETE',
					baseId,
				})) as { records: Remote.DeleteResponce[] }
				results.push(...result.records)
				index = index + 10
			}
			return results
		},
	}
})()
