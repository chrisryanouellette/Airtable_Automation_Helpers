/** This is a demo automation designed to work with the default Airtable Table.
 * Follow the instructions in the README.md for more informations
 */

/** Mappings */
/** Replace these mappings with the ones created for your table */
const { bases, tables, views } = {
    "bases": {
        "developmentSandbox": {
            "id": "appjFE6rC7gpZKZj2",
            "name": "Development Sandbox",
            "tables": {
                "table": "tblhhexDdbeJSS36y"
            }
        }
    },
    "tables": {
        "table": {
            "id": "tblhhexDdbeJSS36y",
            "name": "Table 4",
            "baseId": "appjFE6rC7gpZKZj2",
            "views": {
                "gridView": "viwbZyF4IXO8FneM5"
            }
        }
    },
    "views": {
        "gridView": {
            "id": "viwbZyF4IXO8FneM5",
            "name": "Grid view",
            "tableId": "tblhhexDdbeJSS36y",
            "fields": {
                "name": {
                    "id": "fldnvSV4m9btD0NvU",
                    "tableId": "tblhhexDdbeJSS36y",
                    "viewId": "viwbZyF4IXO8FneM5",
                    "name": "Name",
                    "type": "singleLineText",
                    "refName": "name"
                },
                "notes": {
                    "id": "fldzowqzY9BjSpCTu",
                    "tableId": "tblhhexDdbeJSS36y",
                    "viewId": "viwbZyF4IXO8FneM5",
                    "name": "Notes",
                    "type": "multilineText",
                    "refName": "notes"
                },
                "attachments": {
                    "id": "fldqomT3ehBQIFgkl",
                    "tableId": "tblhhexDdbeJSS36y",
                    "viewId": "viwbZyF4IXO8FneM5",
                    "name": "Attachments",
                    "type": "multipleAttachments",
                    "refName": "attachments"
                },
                "status": {
                    "id": "fldaWWQ12fW5hHhAT",
                    "tableId": "tblhhexDdbeJSS36y",
                    "viewId": "viwbZyF4IXO8FneM5",
                    "name": "Status",
                    "type": "singleSelect",
                    "refName": "status"
                }
            }
        }
    }
}

/** Boilerplate */
/** Custom Record Type Declaration
 * @typedef {Object} CustomRecord
 * @property {string} id
 * @property {string} name
 * @property {string} tableId
 * @property {Object.<string, any>} fields
 */
/** Custom Record Type Declaration
 * @typedef {Object} NewRecord
 * @property {Object.<string, any>} fields
 */
/** Custom Record Type Declaration
 * @typedef {Object} RemoteRecord
 * @property {string} id
 * @property {string} createdTime
 * @property {Object.<string, any>} fields
 */
/** Mappings for Field
 * @typedef {Object} FieldMapping
 * @property {string} id
 * @property {string} tableId
 * @property {string} viewId
 * @property {string} name
 * @property {string} type
 * @property {string} refName
 */
/** Field / Select Options
 * @typedef {Object} SelectOption
 * @property {string} id
 * @property {string} [name]
 * @property {string} [color]
 */
var AT;(()=>{"use strict";var e={30:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.formatCellValue=t.fields=void 0;const r=n(226),i=n(593),o=n(574);t.fields=function(){function e(e){return e}function t(e){return Number(e)}function n(e){const t=new Date(e.slice(0,-1));return isNaN(t.getTime())?null:i.format(t)}function s(e,t){if(!e)return!1;if(!t.some((t=>e.hasOwnProperty(t))))throw new Error(`Object is required to have one of the following fields ${t.map((e=>'"'+e+'"')).join(", ")}`);return!0}function l(e){if(!Array.isArray(e))throw new Error("Field must be an array");return e}function a(e){return"object"==typeof e?s(e,["email","id"])&&e:Array.isArray(e)?e.map((e=>s(e,["email","id"])&&e)):void 0}function d(e){return l(e).map((t=>"string"==typeof e?{id:e}:s(t,["name","id"])&&t))}const c={[o.FieldType.SINGLE_LINE_TEXT]:e,[o.FieldType.MULTILINE_TEXT]:e,[o.FieldType.RICH_TEXT]:e,[o.FieldType.CHECKBOX]:e,[o.FieldType.EMAIL]:e,[o.FieldType.PHONE_NUMBER]:e,[o.FieldType.URL]:e,[o.FieldType.FORMULA]:e,[o.FieldType.NUMBER]:t,[o.FieldType.PERCENT]:t,[o.FieldType.CURRENCY]:t,[o.FieldType.COUNT]:t,[o.FieldType.AUTO_NUMBER]:t,[o.FieldType.DATE]:function(e){const t=new Date(e.replace(/-/g,"/"));return isNaN(t.getTime())?null:i.formatDate(t)},[o.FieldType.DATE_TIME]:n,[o.FieldType.LAST_MODIFIED_TIME]:n,[o.FieldType.CREATED_TIME]:n,[o.FieldType.SINGLE_SELECT]:function(e){return"string"==typeof e?{name:e}:s(e,["name","id"])&&e},[o.FieldType.MULTIPLE_RECORD_LINKS]:d,[o.FieldType.MULTIPLE_SELECTS]:d,[o.FieldType.SINGLE_COLLABORATOR]:a,[o.FieldType.MULTIPLE_COLLABORATORS]:a,[o.FieldType.MULTIPLE_ATTACHMENTS]:function(e){return l(e).map((e=>s(e,["url","id"])&&e))}};function u(e,t){if(!(c[e.type]instanceof Function))return console.warn(`Field "${e.name}" has an unsupported type "${e.type}". Return unkown value.`),t;try{return c[e.type](t)||null}catch(t){throw new Error(`Unable getting cell value for field ${e.type}. ${t.message}`)}}return{convertFieldsToNames:function(e){const{table:t,records:n,mappings:i}=e;if(!n||!n.length)return[];const o="string"==typeof t?r.tables.getTable(t):t,s=r.tables.getMappingsForTable({table:o,mappings:i}),l=r.tables.getMappingsForViews({viewMappings:s});return n.map((e=>{const t={};return Object.entries(l).forEach((([n,r])=>{const i=e.getCellValue(r.id);t[n]=null==i?null:u(r,i)})),{id:e.id,name:e.name,tableId:o.id,fields:t}}))},convertFieldsToIds:function(e){const{table:t,fields:n,mappings:i,opts:s}=e;if(!n||!Object.values(n).length)throw new Error("No fields where passed to convertFieldsToIds.");const l=r.tables.getMappingsForTable({table:t,mappings:i}),a=r.tables.getMappingsForViews({viewMappings:l}),d={};return Object.entries(n).filter((([e,t])=>{var r,i;return(null===(r=a[e])||void 0===r?void 0:r.type)&&(null===(i=a[e])||void 0===i?void 0:i.id)?!(null==s?void 0:s.fieldsOnly)||void 0!==n[e]:(console.warn(`Could not find mapping for ${e}`),!1)})).map((([e,t])=>{const n=a[e];null==t?d[n.id]=null:n.type===o.FieldType.DATE?d[n.id]=t instanceof Date?t.toDateString():t:n.type===o.FieldType.DATE_TIME?d[n.id]=t instanceof Date?t.toISOString():t:d[n.id]=u(n,t)})),d},formatCellValue:u}}(),t.formatCellValue=t.fields.formatCellValue},814:function(e,t,n){var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function s(e){try{a(r.next(e))}catch(e){o(e)}}function l(e){try{a(r.throw(e))}catch(e){o(e)}}function a(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,l)}a((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.records=void 0;const i=n(226);t.records=function(){function e(e,t){return r(this,void 0,void 0,(function*(){const n=[];let r=0;for(;e.length>r;){const i=e.slice(r,r+50);let o=yield t(i);o&&n.push(...o),r+=i.length}return n}))}return{selectRecords(e){let{table:t,view:n,opts:o}=e;const s="string"==typeof t?i.tables.getTable(t):t;if(null===t)throw new Error(`No table with name or id "${t}" found.`);const l=n&&"string"==typeof n?i.tables.getView(t,n):n;if(!s||n&&!l)throw new Error("Select Records: Unable to find Model.");return function(e,t){return r(this,void 0,void 0,(function*(){const n=yield e.selectRecordsAsync(t||{});return n.records.length||console.warn(`Model "${e.name}" does not have any records.`),n}))}(l||s,o)},createRecords(t){return r(this,void 0,void 0,(function*(){const{table:n,records:r}=t,o="string"==typeof n?i.tables.getTable(n):n,s=yield e(r,(e=>o.createRecordsAsync(e)));return Array.isArray(s)?s:[]}))},updateRecords(t){return r(this,void 0,void 0,(function*(){const{table:n,records:r}=t,o="string"==typeof n?i.tables.getTable(n):n;yield e(r,(e=>o.updateRecordsAsync(e)))}))},deleteRecords(t){return r(this,void 0,void 0,(function*(){const{table:n,recordIds:r}=t,o="string"==typeof n?i.tables.getTable(n):n;yield e(r,(e=>o.deleteRecordsAsync(e)))}))}}}()},747:function(e,t,n){var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(i,o){function s(e){try{a(r.next(e))}catch(e){o(e)}}function l(e){try{a(r.throw(e))}catch(e){o(e)}}function a(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,l)}a((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.remote=void 0;const i=n(226),o=n(30);t.remote=function(){function e(e){const t=new Headers;return t.append("Accept","application/json"),t.append("Content-Type","application/json"),t.append("authorization","Bearer "+APIKEY),t.append("x-airtable-user-agent","Airtable.js/0.8.1"),e&&t.append("x-airtable-application-id",e),t}function t(e){return Object.entries(e||{}).map((([e,n])=>Array.isArray(n)?n.map((n=>t({[e]:n}))):`${e}=${encodeURIComponent(n)}`)).join("&")}function n(t){return r(this,void 0,void 0,(function*(){const{path:n,method:r,baseId:i,payload:o}=t;if(("GET"===r||"DELETE"===r)&&o)throw new Error("GET / DELETE requests can not have a request body.");const s=yield fetch(`https://api.airtable.com/v0/${n}`,{headers:e(i),method:r,body:o?JSON.stringify(o):null});if(s.ok)return(yield s.json())||{records:[]};throw new Error(`Remote fetch request failed with message "${s.statusText}" and code ${s.status}`)}))}function s(e){return r(this,void 0,void 0,(function*(){const{records:t,network:r}=e,i=[];let o=0;for(;o<t.length;){const e=t.slice(o,10),s=yield n(Object.assign(Object.assign({},r),{payload:e}));i.push(...s.records),o+=10}return i}))}return{selectRecords:function(e){return r(this,void 0,void 0,(function*(){const{baseId:r,tableId:i,query:o}=e,s=t(o||{}),l=[];let a="";for(;null!==a;){const e=yield n({path:`${r}/${i}?${s}${a?"&offset="+a:""}`,method:"GET",baseId:r});l.push(...e.records),a=e.offset||null}return l}))},convertFieldsToNames:function(e){const{tableId:t,records:n,mappings:r}=e;if(!n||!n.length)return[];const s=i.tables.getMappingsForTable({table:t,mappings:r}),l=i.tables.getMappingsForViews({viewMappings:s});return n.map((e=>{const n={};return Object.entries(l).forEach((([t,r])=>{const i=e.fields[r.name];n[t]=null==i?null:o.formatCellValue(r,i)})),{id:e.id,name:Object.values(e.fields).find((e=>"string"==typeof e)),tableId:t,fields:n}}))},createRecords:function(e){return r(this,void 0,void 0,(function*(){const{baseId:t,tableId:n,records:r}=e;return yield s({network:{path:`${t}/${n}`,method:"POST",baseId:t},records:r})}))},updateRecords:function(e){return r(this,void 0,void 0,(function*(){const{baseId:t,tableId:n,records:r}=e;return yield s({network:{path:`${t}/${n}`,method:"PATCH",baseId:t},records:r})}))},deleteRecords:function(e){return r(this,void 0,void 0,(function*(){const{baseId:t,tableId:r,recordIds:i}=e,o=[];let s=0;for(;s<i.length;){const e=i.slice(s,10),l=yield n({path:`${t}/${r}?${e.map((e=>`records[]=${e}&`))}`,method:"DELETE",baseId:t});o.push(...l.records),s+=10}return o}))}}}()},226:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.tables=void 0,t.tables={getTable(e){let t=null;try{t=base.getTable(e)}catch(n){t=base.tables.find((t=>t.name===e))||null}return t},getView(e,n){const r="string"==typeof e?t.tables.getTable(e):e;let i=null;try{i=r.getView(n)}catch(e){i||(i=r.views.find((e=>e.name===n))||null)}return i},getField(e,n){const r="string"==typeof e?t.tables.getTable(e):e;let i=null;try{i=r.getField(n)}catch(e){i=r.fields.find((e=>e.name===n))||null}return i},getFields(e,n){const r="string"==typeof e?t.tables.getTable(e):e;return n.forEach((e=>t.tables.getField(r,e))),[]},getMappingsForTable(e){const{table:t,mappings:n,opts:r}=e,i="string"!=typeof t?t.id:t,o=Object.entries(n).filter((([e,t])=>t.tableId===i));return(null==r?void 0:r.refNames)?Object.fromEntries(o.filter((([e,t])=>r.refNames.includes(e)))):Object.fromEntries(o)},getMappingsForView(e){const{view:t,mappings:n,opts:r}=e,i="string"!=typeof t?t.id:t,o=Object.values(n).find((e=>e.id===i));if((null==r?void 0:r.refNames)||(null==r?void 0:r.fieldIds)){const e=r.refNames||r.fieldIds,t=Object.entries(o.fields).filter((([t,n])=>e.includes(t)));return Object.fromEntries(t)}return o.fields},getMappingsForViews(e){const{viewMappings:t}=e,n={};return Object.values(t).forEach((e=>Object.entries(e.fields).forEach((([e,t])=>n[e]=t)))),n}}},574:(e,t)=>{var n;Object.defineProperty(t,"__esModule",{value:!0}),t.FieldType=void 0,(n=t.FieldType||(t.FieldType={})).SINGLE_LINE_TEXT="singleLineText",n.EMAIL="email",n.URL="url",n.MULTILINE_TEXT="multilineText",n.NUMBER="number",n.PERCENT="percent",n.CURRENCY="currency",n.SINGLE_SELECT="singleSelect",n.MULTIPLE_SELECTS="multipleSelects",n.SINGLE_COLLABORATOR="singleCollaborator",n.MULTIPLE_COLLABORATORS="multipleCollaborators",n.MULTIPLE_RECORD_LINKS="multipleRecordLinks",n.DATE="date",n.DATE_TIME="dateTime",n.PHONE_NUMBER="phoneNumber",n.MULTIPLE_ATTACHMENTS="multipleAttachments",n.CHECKBOX="checkbox",n.FORMULA="formula",n.CREATED_TIME="createdTime",n.ROLLUP="rollup",n.COUNT="count",n.MULTIPLE_LOOKUP_VALUES="multipleLookupValues",n.AUTO_NUMBER="autoNumber",n.BARCODE="barcode",n.RATING="rating",n.RICH_TEXT="richText",n.DURATION="duration",n.LAST_MODIFIED_TIME="lastModifiedTime",n.CREATED_BY="createdBy",n.LAST_MODIFIED_BY="lastModifiedBy",n.BUTTON="button"},593:(e,t)=>{function n(e){return`${(e.getMonth()+1).toString().padStart(2,"0")}/${e.getDate().toString().padStart(2,"0")}/${e.getFullYear()}`}function r(e){const t=e.getHours()>12?e.getHours()-12:0!==e.getHours()?e.getHours():12,n=e.getMinutes().toString().padStart(2,"0"),r=e.getHours()<12?"AM":"PM";return`${t.toString().padStart(2,"0")}:${n} ${r}`}function i(e){return`${n(e)} ${r(e)}`}Object.defineProperty(t,"__esModule",{value:!0}),t.utils=t.format=t.formatTime=t.formatDate=void 0,t.formatDate=n,t.formatTime=r,t.format=i,t.utils={formatDate:n,formatTime:r,format:i}}},t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={exports:{}};return e[r].call(i.exports,i,i.exports,n),i.exports}var r={};(()=>{var e=r;const t=n(30),i=n(814),o=n(747),s=n(226),l=n(593);e.default=Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},s.tables),i.records),t.fields),l.utils),{remote:o.remote})})(),AT=r.default})();


/** Code Starts Here */
let scriptError = false

/** Load Field options */
/** @type {SelectOption[]} */
const fieldOpions = []
if(!scriptError) {
    try {
        /** @type {Object.<string, FieldMapping>} */
        const { status } = AT.getMappingsForView({
            view: views.gridView.id,
            mappings: views,
            opts: { refNames: ['status'] }
        })
        /** @type {Field} */
        const field = AT.getField(tables.table.id, status.id)
        /** @type {any} */
        const options = field.options // Cast unkown to any
        fieldOpions.push(...options.choices)
    } catch(error) {
        console.error('ERROR LODAING STATUS FIELD', error.message)
        scriptError = true
    }
}

fieldOpions.length && console.info('Status Field Options', fieldOpions)

/** Load Records */
/** @type {CustomRecord[]} */
const records = []
if(!scriptError) {
    try {
        /** @type {RecordQueryResult} */
        const res = await AT.selectRecords({
            table: tables.table.id,
        })
        records.push(...AT.convertFieldsToNames({
            table: tables.table.id,
            records: res.records,
            mappings: views
        }))
    } catch(error) {
        console.error('ERROR LOADING RECORDS', error.message)
        scriptError = true
    }
}

records.length && console.info('Loaded Records', records)

/** Create New Record */
if(!scriptError) {
    try {
        const numOfOpts = fieldOpions.length
        const newFields = AT.convertFieldsToIds({
            table: tables.table.id,
            fields: {
                name: `Random Name ${Math.floor(Math.random() * 100)}`,
                notes: `**Random Notes ${Math.floor(Math.random() * 100)}**`,
                status: { id: fieldOpions[Math.floor(Math.random() * numOfOpts)].id }
            },
            mappings: views,
            opts: { fieldsOnly: true }
        })
        const ids = await AT.createRecords({
            table: tables.table.id,
            records: [ { fields: newFields } ]
        })
        console.info(`Successfully create new record and got new ID "${ids[0]}"`)
    } catch(error) {
        console.error('ERROR CREATING RECORDS', error.message)
        scriptError = true
    }
}

/** Update Records */
if(!scriptError && records.length) {
    try {
        const numOfOpts = fieldOpions.length
        const updateRecords = records.map(rec => ({
            id: rec.id,
            fields: AT.convertFieldsToIds({
                table: tables.table.id,
                fields: {
                    name: `Random Name ${Math.floor(Math.random() * 100)}`,
                    notes: `**Random Notes ${Math.floor(Math.random() * 100)}**`,
                    status: { id: fieldOpions[Math.floor(Math.random() * numOfOpts)].id }
                },
                mappings: views,
                opts: { fieldsOnly: true }
            })
        }))
        await AT.updateRecords({
            table: tables.table.id,
            records: updateRecords
        })
        console.info(`Successfully updated ${records.length} records`)
    } catch(error) {
        console.error('ERROR UPDATING RECORDS', error.message)
        scriptError = true
    }
}

/** Delete a Record */
if(!scriptError && records.length) {
    try {
        await AT.deleteRecords({
            table: tables.table.id,
            recordIds: [ records[0].id ]
        })
        console.info(`Successfully deleted record with id "${records[0].id}"`)
    } catch(error) {
        console.error('ERROR DELETING RECORDS', error.message)
        scriptError = true
    }
}