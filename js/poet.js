const param = {}
const queryStr = decodeURIComponent(window.location.search.substring(1))
for (const query of queryStr.split('&')) {
    const result = query.split('=')
    if (result.length >= 2) {
        param[result[0]] = result[1]
    }
}
const poetName = param['name']

// Redirect to the home page if no poet name
if (!poetName) window.location.pathname = '/'

const poemName = param['poem']

// Init the title
document.title = `${poetName} - 汉语现诗语料库`

const selectedClzName = 'selected-poem'

const menu = document.getElementById('menu')
function renderTitle(list) {
    const poetLabel = `${poetName} ${(list && list.length) || 0} 首`
    document.getElementById('poet-name-label').innerHTML = poetLabel
    const targetPoem = poemName || list[0]
    for (poem of list) {
        const span = document.createElement('span')
        span.innerHTML = poem

        const p = document.createElement('p')
        p.classList.add('title-item')
        p.append(span)
        menu.appendChild(p)

        if (targetPoem === poem) {
            p.classList.add(selectedClzName)
            getJson(`/${poetName}/${targetPoem}.json`, content => renderContent(content, targetPoem))
        }
    }
}

function clearContent(content) {
    let child
    while ((child = content.lastElementChild)) {
        content.removeChild(child)
    }
}
function appendBr(container, count) {
    for (let i = 0; i < count; i++) {
        container.append(document.createElement('br'))
    }
}
function renderContent(lines, title) {
    const content = document.getElementById('content')
    clearContent(content)
    const lineContainer = document.createElement('div')
    lineContainer.classList.add('line-container')

    // title
    const titleP = document.createElement('p')
    titleP.innerHTML = title
    titleP.classList.add('title-line')
    lineContainer.append(titleP)
    appendBr(lineContainer, 2)

    const l = lines || []
    date = l[0]
    for (let i = 1; i < l.length; i++) {
        const line = l[i]
        if (!line) {
            lineContainer.append(document.createElement('br'))
            continue
        }
        const p = document.createElement('p')
        p.classList.add('poem-line')
        p.innerText = line
        lineContainer.append(p)
    }
    if (date) {
        appendBr(lineContainer, 2)
        const dateP = document.createElement('p')
        dateP.classList.add('date-line')
        dateP.innerText = '@ ' + date
        lineContainer.append(dateP)
    }
    appendBr(lineContainer, 5)
    content.append(lineContainer)

    // Set the query make it easy to share
    history.pushState({}, '', `?name=${poetName}&poem=${title}`)
    // Update the title
    document.title = `${title}/${poetName} - 汉语现诗语料库`
}

function clickMenu(event) {
    let p = event.target
    if (!p) return
    if (p.tagName === 'SPAN') {
        p = p.parentNode
    }
    const selectedList = document.getElementsByClassName(selectedClzName)
    for (const selected of selectedList) {
        selected.classList.remove(selectedClzName)
    }
    p.classList.add(selectedClzName)
    getJson(`/${poetName}/${p.innerText}.json`, content => renderContent(content, p.innerText))
}

document.body.onload = () =>
    getJson(
        `/${poetName}/meta.json`,
        renderTitle,
        // if error, redirect the home page, mostly is 404
        () => (window.location.pathname = '/')
    )
