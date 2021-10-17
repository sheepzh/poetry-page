function n2d(num) {
    return num < 10 ? '0' + num : num
}
function setTotal(totalCount, poetCount, wordCount, timestamp) {
    totalCount = totalCount || '-'
    poetCount = poetCount || '-'
    wordCount = wordCount || '-'
    tsStr = '-'
    if (timestamp) {
        const time = new Date(timestamp)
        const year = time.getFullYear()
        const month = time.getMonth() + 1
        const date = time.getDate()
        const hour = time.getHours()
        const minute = time.getMinutes()
        const seconds = time.getSeconds()
        console.log(seconds)
        tsStr = `${year}-${n2d(month)}-${n2d(date)} ${n2d(hour)}:${n2d(minute)}:${n2d(seconds)} 更新`
    }
    document.getElementById(
        'total-title'
    ).innerText = `${totalCount} 位 / ${poetCount} 首 / ${wordCount} 字 / ${tsStr}`
}

setTotal()

// Update count of poet
getJson('/meta.json', (data) => setTotal(data.ac, data.pc, data.wc, data.ts))

function groupByFirstLetter(data) {
    const grouped = {}
    data = data.sort((a, b) => (a.n === b.n ? 0 : a.n > b.n ? 1 : -1))
    for (const item of data) {
        let firstLetter = item.p[0]
        if (!/[a-z]/.test(firstLetter)) {
            firstLetter = '#'
        }
        let existList = grouped[firstLetter]
        !existList && (existList = grouped[firstLetter] = [])
        existList.push(item)
    }
    return grouped
}

const cardContainer = document.getElementById('poet-card-container')

function renderCard(label, items) {
    // table
    const table = document.createElement('table')
    table.classList.add('card-table')

    // label
    const labelTr = document.createElement('tr')
    const labelTd = document.createElement('td')
    labelTd.classList.add('card-label')
    labelTd.innerText = label
    labelTr.append(labelTd)
    table.append(labelTr)

    // links
    if (items && items.length) {
        const linkTr = document.createElement('tr')
        const linkTd = document.createElement('td')
        linkTd.classList.add('card-link')
        for (item of items) {
            const link = document.createElement('a')
            const name = item.n
            link.innerText = name
            link.href = `/poet.html?name=${name}`
            linkTd.append(link)
        }
        linkTr.append(linkTd)
        table.append(linkTr)
    }

    cardContainer.append(table)
}

function renderCards(data) {
    const grouped = groupByFirstLetter(data)
    const charCodeOfLowerA = 'a'.charCodeAt(0)
    const charCodeOfUpperA = 'A'.charCodeAt(0)
    for (let i = 0; i < 26; i++) {
        const key = String.fromCharCode(charCodeOfLowerA + i)
        const label = String.fromCharCode(charCodeOfUpperA + i)
        renderCard(label, grouped[key] || [])
    }
    renderCard('#', grouped['#'] || [])
}

// Render the card
document.body.onload = () => getJson('/list.json', renderCards)