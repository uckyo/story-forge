import { defineStore } from 'pinia'

export const useBookStore = defineStore('book', {
  state: () => ({
    books: [],
    currentBookId: null,
    nextId: 1,
    nextCardId: 1
  }),

  // 初始化示例数据
  initializeSampleData() {
    // 只在没有书本时创建示例故事
    if (this.books.length === 0) {
      // 创建一个示例故事
      const sampleBook = this.createBook({
        title: '我的第一个故事',
        description: '这是一个示例故事，您可以编辑它或创建新的故事。'
      })

      // 设置为当前故事
      this.setCurrentBook(sampleBook.id)
    }
  },

  getters: {
    getBookById: (state) => (id) => {
      return state.books.find(book => book.id === id)
    },

    currentBook: (state) => {
      // 调试信息，帮助诊断currentBook为null的原因
      console.log('currentBook getter called')
      console.log('state.currentBookId:', state.currentBookId)
      console.log('state.books.length:', state.books.length)
      
      if (!state.currentBookId) {
        console.warn('currentBook is null: No currentBookId set')
        return null
      }
      
      const book = state.books.find(book => book.id === state.currentBookId)
      
      if (!book) {
        console.warn(`currentBook is null: Book with id ${state.currentBookId} not found in books array`)
        // 如果找不到对应的书本，我们可以提供更多信息
        if (state.books.length > 0) {
          console.warn(`Available book IDs: ${state.books.map(b => b.id).join(', ')}`)
        } else {
          console.warn('No books available in state.books array')
        }
      }
      
      return book
    },

    // 获取当前书本的所有卡片（合并所有类型的卡片）
    currentBookCards: (state) => {
      const currentBook = state.books.find(book => book.id === state.currentBookId)
      if (!currentBook) return []

      // 合并所有非剧情点卡片（角色、地点、物品、事件、设定）
      return [
        ...(currentBook.characters || []),
        ...(currentBook.locations || []),
        ...(currentBook.items || []),
        ...(currentBook.events || []),
        ...(currentBook.settings || [])
      ]
    }
  },

  actions: {
    // 创建新书
    createBook(bookData) {
      const newBook = {
        id: this.nextId++,
        title: bookData.title || '未命名书本',
        description: bookData.description || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // 确保创建空内容的新书本
        characters: [], // 空的人物卡片数组
        locations: [], // 空的地点卡片数组
        items: [], // 空的物品卡片数组
        events: [], // 空的事件卡片数组
        settings: [], // 空的设定卡片数组
        plotPoints: [] // 空的剧情点卡片数组 (同时作为时间线使用)
      }

      this.books.push(newBook)
      this.saveBooks()
      return newBook
    },

    // 更新书本
    updateBook(updatedBook) {
      const index = this.books.findIndex(book => book.id === updatedBook.id)
      if (index !== -1) {
        this.books[index] = {
          ...this.books[index],
          ...updatedBook,
          updatedAt: Date.now()
        }
        this.saveBooks()
      }
    },

    // 删除书本
    deleteBook(id) {
      const index = this.books.findIndex(book => book.id === id)
      if (index !== -1) {
        this.books.splice(index, 1)
        if (this.currentBookId === id) {
          this.currentBookId = null
        }
        this.saveBooks()
      }
    },

    // 设置当前书本
    setCurrentBook(id) {
      console.log('setCurrentBook called with id:', id)
      
      // 验证ID是否存在于books数组中
      if (id) {
        const bookExists = this.books.some(book => book.id === id)
        if (!bookExists) {
          console.warn(`Warning: Book with id ${id} does not exist in books array`)
        }
      }
      
      this.currentBookId = id
      
      // 立即检查设置后的currentBook是否有效
      const newCurrentBook = this.currentBook
      console.log('After setCurrentBook, currentBook is:', newCurrentBook)
    },

    // 保存书本数据
    saveBooks() {
      localStorage.setItem('storyforge_books', JSON.stringify(this.books))
      localStorage.setItem('storyforge_current_book', this.currentBookId)
      localStorage.setItem('storyforge_book_next_id', this.nextId)
      localStorage.setItem('storyforge_card_next_id', this.nextCardId)
    },

    // 加载书本数据
    loadBooks() {
      try {
        const booksData = localStorage.getItem('storyforge_books')
        if (booksData) {
          this.books = JSON.parse(booksData)
        }

        const currentBookId = localStorage.getItem('storyforge_current_book')
        if (currentBookId) {
          // 确保currentBookId是有效的数字
          const parsedId = parseInt(currentBookId)
          if (!isNaN(parsedId)) {
            this.currentBookId = parsedId
          } else {
            console.warn('Invalid currentBookId in localStorage, setting to null')
            this.currentBookId = null
          }
        }

        const nextId = localStorage.getItem('storyforge_book_next_id')
        if (nextId) {
          const parsedNextId = parseInt(nextId)
          if (!isNaN(parsedNextId)) {
            this.nextId = parsedNextId
          }
        }

        const nextCardId = localStorage.getItem('storyforge_card_next_id')
        if (nextCardId) {
          const parsedNextCardId = parseInt(nextCardId)
          if (!isNaN(parsedNextCardId)) {
            this.nextCardId = parsedNextCardId
          }
        } else {
          // 如果没有nextCardId，则尝试从现有卡片中计算最大值
          this.calculateNextCardId()
        }
        
        // 如果currentBookId无效且有书本，自动设置第一个书本为当前书本
        if (!this.currentBookId && this.books.length > 0) {
          console.log('Setting first book as current book since currentBookId is invalid')
          this.currentBookId = this.books[0].id
        }
      } catch (error) {
        console.error('加载书本数据失败:', error)
      }
    },

    // 计算下一个卡片ID，确保不会重复
    calculateNextCardId() {
      let maxId = 1
      this.books.forEach(book => {
        // 检查所有类型的卡片数组
        const cardArrays = [
          book.characters || [],
          book.locations || [],
          book.items || [],
          book.events || [],
          book.settings || [],
          book.plotPoints || []
        ]

        cardArrays.forEach(array => {
          if (array.length > 0) {
            const arrayMaxId = Math.max(...array.map(card => card.id || 0), 0)
            maxId = Math.max(maxId, arrayMaxId + 1)
          }
        })
      })
      this.nextCardId = maxId
    },

    // 清除所有书本
    clearBooks() {
      this.books = []
      this.currentBookId = null
      this.nextId = 1
      this.saveBooks()
    },

    // 导入书本数据
    importBookData(bookData) {
      if (bookData) {
        // 生成新的ID避免冲突
        const importBookId = this.nextId++
        
        // 创建导入的书本，确保只包含必要的字段和空的卡片数组
        const newBook = {
          id: importBookId,
          title: bookData.title || '导入的书本',
          description: bookData.description || '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          // 确保所有卡片数组都是空的，避免继承其他书本内容
          characters: [],
          locations: [],
          items: [],
          events: [],
          settings: [],
          plotPoints: []
        }
        
        this.books.push(newBook)
        this.saveBooks()
      }
    },



    // 根据类型获取当前书本的卡片
    getCardsByType(type) {
      const currentBook = this.currentBook
      if (!currentBook) return []

      switch (type) {
        case 'character':
          return currentBook.characters || []
        case 'location':
          return currentBook.locations || []
        case 'item':
          return currentBook.items || []
        case 'event':
          return currentBook.events || []
        case 'setting':
          return currentBook.settings || []
        case 'plotPoint':
          return currentBook.plotPoints || []
        default:
          return []
      }
    },

    // 根据ID获取卡片
    getCardById(id) {
      const currentBook = this.currentBook
      if (!currentBook) return null

      // 在所有类型的卡片中查找，包括剧情点
      let allCards = this.currentBookCards
      
      // 添加剧情点到卡片列表中
      if (currentBook.plotPoints && Array.isArray(currentBook.plotPoints)) {
        allCards = [...allCards, ...currentBook.plotPoints]
      }
      
      return allCards.find(card => card.id === id)
    },

    // 获取当前书本的剧情点列表
    getCurrentBookPlotPoints() {
      const currentBook = this.currentBook
      if (!currentBook) {
        console.warn('getCurrentBookPlotPoints called but currentBook is null')
        return []
      }
      return currentBook.plotPoints || []
    },

    // 获取当前书本的时间线
    getCurrentBookTimeline() {
      const currentBook = this.currentBook
      if (!currentBook) {
        console.warn('getCurrentBookTimeline called but currentBook is null')
        return []
      }
      
      const plotPoints = currentBook.plotPoints || []
      
      // 为每个剧情点添加正确的索引
      return plotPoints.map((point, index) => {
        return {
          ...point,
          index: index
        }
      })
    },

    // 创建新卡片
    createCard(cardData) {

      console.log('cardData11', cardData)
      const currentBook = this.currentBook
      console.log('currentBook:', currentBook)
      console.log('currentBookId:', this.currentBookId)
      console.log('books array length:', this.books.length)
      
      if (!currentBook) {
        console.error('Failed to get current book. This should not happen during normal operation.')
        console.error('Diagnostic info:')
        console.error('- currentBookId is:', this.currentBookId)
        console.error('- books array has', this.books.length, 'items')
        if (this.books.length > 0) {
          console.error('- Available books IDs:', this.books.map(b => b.id))
        }
        return null
      }

      // 基础卡片数据
      const newCardData = {
        type: cardData.type,
        name: cardData.name || '未命名',
        brief: cardData.brief || '',
        content: cardData.content || '',
        color: cardData.color || '',
        tags: cardData.tags || [],
        relations: cardData.relations || []
      }

      // 根据卡片类型添加特有字段
      switch (cardData.type) {
        case 'character':
          newCardData.age = cardData.age || ''
          newCardData.gender = cardData.gender || ''
          newCardData.personality = cardData.personality || ''
          break
        case 'location':
          newCardData.locationType = cardData.locationType || ''
          newCardData.region = cardData.region || ''
          newCardData.geography = cardData.geography || ''
          break
        case 'item':
          newCardData.itemType = cardData.itemType || ''
          newCardData.owner = cardData.owner || ''
          newCardData.value = cardData.value || ''
          break
        case 'event':
          newCardData.time = cardData.time || ''
          newCardData.location = cardData.location || ''
          newCardData.participants = cardData.participants || ''
          break
        case 'setting':
          newCardData.category = cardData.category || ''
          newCardData.influence = cardData.influence || ''
          break
        case 'plotPoint':
          newCardData.plotType = cardData.plotType || 'main'
          // 剧情点不需要name字段，使用content作为名称
          if (!newCardData.name) {
            newCardData.name = newCardData.content || '未命名剧情点'
          }
          break
      }

      // 创建最终卡片对象
      const newCard = {
        ...newCardData,
        id: this.nextCardId++,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      console.log('newCard', newCard)
      // 根据卡片类型添加到对应的数组
      switch (cardData.type) {
        case 'character':
          if (!currentBook.characters) currentBook.characters = []
          currentBook.characters.push(newCard)
          break
        case 'location':
          if (!currentBook.locations) currentBook.locations = []
          currentBook.locations.push(newCard)
          break
        case 'item':
          if (!currentBook.items) currentBook.items = []
          currentBook.items.push(newCard)
          break
        case 'event':
          if (!currentBook.events) currentBook.events = []
          currentBook.events.push(newCard)
          break
        case 'setting':
          if (!currentBook.settings) currentBook.settings = []
          currentBook.settings.push(newCard)
          break
        case 'plotPoint':
          if (!currentBook.plotPoints) currentBook.plotPoints = []
          currentBook.plotPoints.push(newCard)
          break
      }

      this.saveBooks()
      return newCard
    },

    // 更新卡片
    updateCard(updatedCard) {
      const currentBook = this.currentBook
      if (!currentBook || !updatedCard.id) return null

      const cardId = updatedCard.id
      const card = this.getCardById(cardId)
      if (!card) return null

      // 根据卡片类型更新对应的数组
      const updateArray = (array) => {
        if (array) {
          const index = array.findIndex(c => c.id === cardId)
          if (index !== -1) {
            array[index] = {
              ...array[index],
              ...updatedCard,
              updatedAt: Date.now()
            }
            return array[index]
          }
        }
        return null
      }

      // 尝试在每种类型的数组中更新
      let updated
      switch (card.type) {
        case 'character':
          updated = updateArray(currentBook.characters)
          break
        case 'location':
          updated = updateArray(currentBook.locations)
          break
        case 'item':
          updated = updateArray(currentBook.items)
          break
        case 'event':
          updated = updateArray(currentBook.events)
          break
        case 'setting':
          updated = updateArray(currentBook.settings)
          break
        case 'plotPoint':
          updated = updateArray(currentBook.plotPoints)
          break
      }

      if (updated) {
        this.saveBooks()
        return updated
      }
      return null
    },

    // 删除卡片
    deleteCard(id) {
      const currentBook = this.currentBook
      if (!currentBook) return false

      // 找到卡片
      const card = this.getCardById(id)
      if (!card) return false

      const deleteFromArray = (array) => {
        if (!array || !Array.isArray(array)) return false
        const index = array.findIndex(c => c.id === id)
        if (index !== -1) {
          array.splice(index, 1)
          return true
        }
        return false
      }

      let deleted = false
      switch (card.type) {
        case 'character':
          deleted = deleteFromArray(currentBook.characters)
          break
        case 'location':
          deleted = deleteFromArray(currentBook.locations)
          break
        case 'item':
          deleted = deleteFromArray(currentBook.items)
          break
        case 'event':
          deleted = deleteFromArray(currentBook.events)
          break
        case 'setting':
          deleted = deleteFromArray(currentBook.settings)
          break
        case 'plotPoint':
          deleted = deleteFromArray(currentBook.plotPoints)
          // 不再需要从timeline数组删除，因为直接管理plotPoints数组
          break
      }

      this.saveBooks()
      return deleted
    },

    // 导出书本数据
    exportBookData(bookId) {
      const book = this.getBookById(bookId)
      if (book) {
        return {
          id: book.id,
          title: book.title,
          description: book.description,
          coverColor: book.coverColor,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
          characters: book.characters || [],
          locations: book.locations || [],
          items: book.items || [],
          events: book.events || [],
          settings: book.settings || [],
          plotPoints: book.plotPoints || [],
          timeline: book.timeline || []
        }
      }
      return null
    },

    // 清空当前书本的卡片库（只清空角色、地点、物品、事件、设定卡片）
    clearCards() {
      const currentBook = this.currentBook

      if (currentBook) {
        currentBook.characters = []
        currentBook.locations = []
        currentBook.items = []
        currentBook.events = []
        currentBook.settings = []
        this.saveBooks()
      }
    },

  }
})