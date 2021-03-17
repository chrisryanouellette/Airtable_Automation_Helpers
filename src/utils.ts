export function formatDate(date: Date): string {
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const day = date.getDate().toString().padStart(2, '0')
	return `${month}/${day}/${date.getFullYear()}`
}

export function formatTime(date: Date): string {
	const hour =
		date.getHours() > 12
			? date.getHours() - 12
			: date.getHours() !== 0
			? date.getHours()
			: 12
	const minute = date.getMinutes().toString().padStart(2, '0')
	const abbr = date.getHours() < 12 ? 'AM' : 'PM'
	return `${hour.toString().padStart(2, '0')}:${minute} ${abbr}`
}

export function format(date: Date): string {
	return `${formatDate(date)} ${formatTime(date)}`
}

export function getTimestamp(args: { date?: Date; timeZone: string }): string {
	const { date = new Date(), timeZone } = args
	return date.toLocaleString('en-US', { timeZone })
}

export const utils = {
	formatDate,
	formatTime,
	format,
	getTimestamp,
}
