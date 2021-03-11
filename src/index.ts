import { fields } from './fields'
import { records } from './records'
import { remote } from './remote'
import { tables } from './tables'
import { utils } from './utils'

export default {
	...tables,
	...records,
	...fields,
	...utils,
	remote: remote,
}
