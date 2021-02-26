import { records } from './records'
import { remote } from './remote'
import { tables } from './tables'
import { utils } from './utils'

export default {
	...tables,
	...records,
	...utils,
	remote: remote,
}
