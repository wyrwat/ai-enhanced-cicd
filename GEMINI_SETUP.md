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

## 💰 **Podpięcie Budżetu (Dla Paid Tier)**

### **⚠️ WAŻNE: Jeśli masz budżet, musisz go podpiąć do właściwego projektu!**

1. **Sprawdź swój projekt Google Cloud:**
   - Idź na: https://console.cloud.google.com/
   - Sprawdź w jakim projekcie jest twój API Key

2. **Włącz billing dla tego projektu:**
   - Idź na: https://console.cloud.google.com/billing
   - Wybierz projekt z API Key
   - Kliknij **"Link a billing account"**
   - Wybierz lub utwórz billing account

3. **Sprawdź czy billing jest aktywny:**
   - W projekcie powinno być: **"Billing account: [Nazwa]"**
   - Status: **"Enabled"**

4. **Użyj modelu dla paid tier:**
   - W GitHub Secrets dodaj: `GEMINI_PAID_TIER` = `true`
   - Lub w `.env`: `GEMINI_MODEL=gemini-1.5-flash`

**Bez podpiętego billing account, API używa free tier (limit 20/dzień)!**

## 🎯 **GitHub Actions Setup**

### **⚠️ WAŻNE: Dodaj Secret do GitHub (WYMAGANE!):**

**Bez tego kroku AI nie będzie działać na GitHub Actions!**

1. Idź na: `https://github.com/wyrwat/ai-enhanced-cicd/settings/secrets/actions`
2. Kliknij **"New repository secret"**
3. Name: `GEMINI_API_KEY`
4. Value: Wklej swój klucz API z Google AI Studio (np. `AIzaSy...`)
5. Kliknij **"Add secret"**

6. **Dla paid tier (opcjonalnie):**
   - Name: `GEMINI_PAID_TIER`
   - Value: `true`

### **✅ Workflows już skonfigurowane:**
Wszystkie nasze workflows już używają secrets:
```yaml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

**Po dodaniu secret, GitHub Actions automatycznie użyje prawdziwego AI!** 🚀

## 📊 **Limity Gemini:**

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Requests per minute** | 15 | 60+ |
| **Requests per day** | 1,500 | Unlimited* |
| **Monthly cost** | **$0** | Pay-as-you-go |
| **Tokens per request** | 32,000 | 32,000+ |

**💡 Tip:** Jeśli masz budżet, możesz użyć płatnego planu dla większych limitów. Rate limiting w kodzie działa dla obu planów.

### **⚠️ WAŻNE: Użyj modelu dla paid tier!**

Jeśli masz podpięty budżet, **musisz użyć innego modelu**:

```bash
# W .env lub GitHub Secrets
GEMINI_PAID_TIER=true
# LUB konkretny model:
GEMINI_MODEL=gemini-1.5-flash
```

**Modele:**
- `gemini-2.5-flash` - Działa dla free i paid tier ✅ (domyślny)
  - Free tier: limit 20/dzień
  - Paid tier: większe limity (z podpiętym billing account)
- `gemini-2.0-flash-exp` - Eksperymentalny (jeśli dostępny)

**⚠️ Ważne:** 
- `gemini-1.5-flash` nie jest dostępny w API v1beta
- Kod domyślnie używa `gemini-2.5-flash`
- Z podpiętym billing account, `gemini-2.5-flash` ma większe limity (paid tier)

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
