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
const pageStr = param['page']
let pageNum = Number.parseInt(pageStr) || 1
let poemName = param['poem']
let totalPage = 0

// Init the title
document.title = `${poetName} - 汉语现诗语料库`

const selectedClzName = 'selected-poem'

const menu = document.getElementById('menu')
function renderTitle(meta) {
    const poetLabel = `${poetName} ${meta?.t || 0} 首`
    document.getElementById('poet-name-label').innerHTML = poetLabel
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
function renderContent(lines, title, date) {
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

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
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
    history.pushState({}, '', `?name=${poetName}&poem=${title}&page=${pageNum}`)
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
    const title = p.innerText
    const item = currentData[title]
    const lines = item.content.split('\n')
    const date = item.date
    renderContent(lines, title, date)
}

let currentData = {}
function changePage(newPage, targetPoemTitle) {
    if (!newPage || newPage < 0 || newPage > totalPage) {
        return
    }
    pageNum = newPage
    document.getElementById('current-page').innerText = pageNum
    Array.from(menu.children).forEach(element => element.remove())
    currentData = {}
    let poemToClick = undefined
    getJson(`/${poetName}/${pageNum}.json`, list => {
        for (let item of list) {
            const title = item.title
            currentData[title] = item

            const p = document.createElement('p')
            const span = document.createElement('span')
            span.innerHTML = item.title
            p.append(span)
            p.classList.add('title-item')
            menu.append(p)
            // 初始化打开第一条
            poemToClick = poemToClick || p
            // 如果指定了则打开指定的
            title === targetPoemTitle && (poemToClick = p)
        }
        poemToClick?.click?.()
    })
    pageNum === 1 ? prevPageBtn.classList.add("disabled") : prevPageBtn.classList.remove("disabled")
    pageNum === totalPage ? nextPageBtn.classList.add("disabled") : nextPageBtn.classList.remove("disabled")
}

function nextPage() {
    changePage(pageNum + 1)
}

function previousPage() {
    changePage(pageNum - 1)
}

const prevPageBtn = document.getElementById('prev-page')
const nextPageBtn = document.getElementById('next-page')

document.body.onload = () =>
    getJson(
        `/${poetName}/meta.json`,
        (meta) => {
            renderTitle(meta)
            totalPage = meta.p || 0
            document.getElementById('total-page').innerText = totalPage
            changePage(pageNum, poemName)
        },
        // if error, redirect the home page, mostly is 404
        () => (window.location.pathname = '/')
    )
