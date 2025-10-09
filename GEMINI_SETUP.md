# 🤖 Google Gemini AI Setup Instructions

## 🆓 **Darmowy Google Gemini API Key**

### **Krok 1: Uzyskaj API Key**
1. Idź na: **https://makersuite.google.com/app/apikey**
2. Zaloguj się kontem Google
3. Kliknij **"Create API Key"**
4. Skopiuj wygenerowany klucz

### **Krok 2: Konfiguracja lokalna**
```bash
# Stwórz plik .env w głównym folderze
echo "GEMINI_API_KEY=your-api-key-here" > .env

# Lub export w terminalu
export GEMINI_API_KEY="your-api-key-here"
```

### **Krok 3: Testowanie AI**
```bash
# Uruchom demo z prawdziwym AI
GEMINI_API_KEY="your-key" npx ts-node demo-runner.ts optimize

# Lub z .env file
npx ts-node demo-runner.ts optimize
```

## 🎯 **GitHub Actions Setup**

### **⚠️ WAŻNE: Dodaj Secret do GitHub (WYMAGANE!):**

**Bez tego kroku AI nie będzie działać na GitHub Actions!**

1. Idź na: `https://github.com/wyrwat/ai-enhanced-cicd/settings/secrets/actions`
2. Kliknij **"New repository secret"**
3. Name: `GEMINI_API_KEY`
4. Value: `AIzaSyCDcUbo6lV7E2s49IyykMUI733TNsZ8-LY` (twój klucz)
5. Kliknij **"Add secret"**

### **✅ Workflows już skonfigurowane:**
Wszystkie nasze workflows już używają secrets:
```yaml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

**Po dodaniu secret, GitHub Actions automatycznie użyje prawdziwego AI!** 🚀

## 📊 **Darmowe limity Gemini:**

| Feature | Free Tier |
|---------|-----------|
| **Requests per minute** | 15 |
| **Requests per day** | 1,500 |
| **Monthly cost** | **$0** |
| **Tokens per request** | 32,000 |

## 🎬 **Co zobaczysz z prawdziwym AI:**

### **Bez API Key (fallback):**
```
🤖 Gemini AI not configured, using fallback analysis
🎯 Generated 2 test predictions (fallback)
```

### **Z API Key (prawdziwy AI):**
```
🤖 Gemini AI enabled for real code analysis!
🤖 Using Gemini AI for real code analysis...
🎯 Gemini AI generated 3 predictions
🤖 AI Risk Level: HIGH
🎯 AI Confidence: 89.2%
```

## 🚀 **Test Commands:**

```bash
# Test bez AI (fallback)
npx ts-node demo-runner.ts optimize

# Test z AI (z API key)
GEMINI_API_KEY="your-key" npx ts-node demo-runner.ts optimize

# Full AI demo
GEMINI_API_KEY="your-key" npx ts-node demo-runner.ts --full

# AI-enhanced tests
GEMINI_API_KEY="your-key" npm run test:smart
```

## 💡 **Benefits prawdziwego AI:**

### **Mock Analysis:**
- Stałe wartości (78% failure probability)
- Proste heurystyki
- Brak prawdziwej analizy kodu

### **Gemini AI Analysis:**
- ✅ **Prawdziwa analiza** git diff
- ✅ **Inteligentne reasoning** 
- ✅ **Dynamiczne confidence scores**
- ✅ **Kontekstowe recommendations**
- ✅ **Adaptive risk assessment**

---

**🎯 Ready to experience real AI in your CI/CD pipeline!**
