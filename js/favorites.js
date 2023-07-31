import { GitHubUser } from "./githubuser.js"

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase())

            if(userExists) {
                throw new Error('Usuário já cadastrado')
            }

            const user = await GitHubUser.search(username)
            if(user.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()
        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        this.entries = this.entries
            .filter((entry) => entry.login !== user.login)
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)
        this.tbody = this.root.querySelector('table tbody')
        this.update()
        this.onAdd()
    }

    onAdd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            this.add(value)
        }
    }

    update() {
        this.removeAllTr()
        this.changeTable()

        this.entries.forEach(user => {
            const row = this.createRow()
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = `/${user.login}`
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers
            row.querySelector('.remove').onclick = () => {
              const isOk = confirm('Tem certeza que deseja deletar essa linha?')
              if(isOk) {
                this.delete(user)
              }
            }
            
            this.tbody.append(row)
        })

    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
        <tr>
            <td class="user">
                <img src="https://github.com/thiagovirtuoso.png" alt="Imagem de thiago">
                <a href="https://github.com/thiagovirtuoso" target="_blank">
                    <p>Thiago Virtuoso</p>
                    <span>/thiagovirtuoso</span>
                </a>
            </td>
            <td class="repositories">
                76
            </td>
            <td class="followers">
                9589
            </td>
            <td>
                <button class="remove">Remover</button>
            </td>
        </tr>
        `

        return tr
    }

    changeTable() {
        const favTable = this.root.querySelector('.favorites')
        const noFavTable = this.root.querySelector('.no-favorites')

        if(this.entries.length <= 0) {
            favTable.classList.add('hide')
            noFavTable.classList.remove('hide')
        }   else {
            favTable.classList.remove('hide')
            noFavTable.classList.add('hide')
        }
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove()
            })
    }
}
