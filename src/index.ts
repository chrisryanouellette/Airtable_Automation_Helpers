import { records } from './records'
import { remote } from './remote'
import { tables } from './tables'

export default {
	...tables,
	...records,
	remote: remote,
}
