import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import * as Progress from 'react-native-progress';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// --- Data Store for all Modules and Quizzes from the first code ---
// This data will replace the mock data.
const appData = [
  // Module 1
  {
    level: 1,
    title: 'Module 1: Why Invest? The Basics of Personal Finance 📚',
    content: [
      {
        heading: '1.1 Savings vs. Investing',
        body:
          "Savings is the portion of your income not used for expenses. It's typically kept in a bank account, where it's safe and highly liquid but earns low interest. Savings are for short-term goals or emergencies.\n\nInvesting is setting your money aside in various products with the expectation that it will grow over a longer period. Investments carry risk but have the potential to earn much more than a savings account, helping you achieve long-term goals.",
      },
      {
        heading: '1.2 The Power of Compounding 📈',
        body:
          "Compounding is the process where your investment grows exponentially because you earn returns not just on your initial principal but also on the accumulated earnings. Starting early is key. The 'Rule of 72' is a simple way to estimate how long it will take for an investment to double. Just divide 72 by the annual interest rate.",
      },
      {
        heading: '1.3 The Impact of Inflation 💨',
        body:
          "Inflation is the rise in prices over time. As prices increase, the purchasing power of your money goes down. Your financial plan must aim to earn returns that are higher than the rate of inflation. If your investment earns 7% but inflation is 6%, your 'real rate of return' is only 1%.",
      },
      {
        heading: '1.4 The Concept of Risk and Return ⚖️',
        body:
          'Risk and return go hand in hand. Risk is the chance of losing some or all of the money you\'ve invested. Return is the potential reward you get for taking that risk. The fundamental rule is: the higher the potential return, the higher the risk.',
      },
      {
        heading: '1.5 SMART Financial Goals 🎯',
        body:
          "A good financial goal should be SMART: Specific, Measurable, Achievable, Realistic, and Time-bound. For example, 'I will save ₹50,000 every year for the next 10 years for my daughter's marriage.'",
      },
    ],
    videoEmbedId: 'Xn7KWR9EOGQ',
    quiz: [
      {
        question: 'What is the primary effect of inflation on your savings?',
        options: [
          'It increases the interest rate earned on your savings.',
          'It decreases the purchasing power of your money.',
          'It guarantees a positive real rate of return.',
          'It has no effect on the value of money.',
        ],
        answer: 'It decreases the purchasing power of your money.',
      },
      {
        question: "The 'Rule of 72' is a simple way to estimate...",
        options: [
          'The amount of tax you will pay on your investment.',
          'The monthly EMI for a loan.',
          'How long it will take for an investment to double in value.',
          'The amount of risk in a portfolio.',
        ],
        answer: 'How long it will take for an investment to double in value.',
      },
    ],
  },
  // Module 2
  {
    level: 1,
    title: 'Module 2: Introduction to the Indian Securities Market 🏛️',
    content: [
      {
        heading: '2.1 What is a Securities Market?',
        body:
          'The securities market is the mechanism that brings together suppliers of capital (investors) and users of capital (companies). It mobilizes savings and channels them into productive ventures.',
      },
      {
        heading: '2.2 The Market Regulator: SEBI',
        body:
          'The Securities and Exchange Board of India (SEBI) is the regulator for the securities market in India. Its key mandates are to protect investors, promote market development, and regulate the market.',
      },
      {
        heading: '2.3 Market Structure and Participants',
        body:
          'Key participants include: Stock Exchanges (BSE, NSE), Clearing Corporations, Depositories (NSDL, CDSL), Companies (Issuers), Investors, and Intermediaries (like Stock Brokers).',
      },
      {
        heading: '2.4 Primary vs. Secondary Markets',
        body:
          'The Primary Market is where securities are issued for the first time (e.g., an IPO). The Secondary Market is where already-issued securities are traded among investors, providing liquidity.',
      },
    ],
    quiz: [
      {
        question: 'Who regulates the commodity derivatives market in India?',
        options: ['RBI', 'IRDAI', 'PFRDA', 'SEBI'],
        answer: 'SEBI',
      },
      {
        question: 'Which among the given options is a key mandate for SEBI?',
        options: [
          'Regulation of securities market',
          'Protect the interest of investors',
          'Promote the development of securities market',
          'All the three',
        ],
        answer: 'All the three',
      },
    ],
  },
  // Module 3
  {
    level: 1,
    title: 'Module 3: Your First Steps into the Market 🚀',
    content: [
      {
        heading: '3.1 Pre-requisites for Investing',
        body:
          'To trade, you need three accounts: a Savings Bank Account, a Trading Account with a stock broker, and a Demat Account with a Depository Participant (DP) to hold securities electronically.',
      },
      {
        heading: '3.2 What Can You Invest In?',
        body:
          'You can invest in Equity Shares (ownership), Debt Instruments (loans like bonds), Mutual Funds (pooled investments), and Commodity Derivatives (contracts on goods like gold).',
      },
      {
        heading: '3.3 Your Rights as a Shareholder 📜',
        body:
          "As a part-owner, you have the right to receive dividends, get the company's Annual Report, attend meetings, and vote on key corporate decisions.",
      },
    ],
    quiz: [
      {
        question:
          'Which among the given options is a prerequisite for starting trading in the commodity derivatives market?',
        options: [
          'Opening a Trading Account with a SEBI registered stock broker and completing the process of Know Your Client (KYC)',
          'Should be trading in the physical market',
          'Should have adequate stock in a warehouse/designated vault',
          'Should have experience of trading on a Regional exchange platform',
        ],
        answer:
          'Opening a Trading Account with a SEBI registered stock broker and completing the process of Know Your Client (KYC)',
      },
      {
        question:
          'Hedging is a price risk management mechanism used by stakeholders who have...',
        options: [
          'little or no exposure to the physical commodity',
          'an exposure to the financial market',
          'an exposure to the physical commodity',
          'none of these',
        ],
        answer: 'an exposure to the physical commodity',
      },
    ],
  },
  // Module 4
  {
    level: 2,
    title: 'Module 4: Getting Started - Accounts & KYC 📝',
    content: [
      {
        heading: '4.1 Opening Accounts & KYC',
        body:
          "To open accounts, you must complete the KYC (Know Your Client) process. You'll need Proof of Identity (PAN card is mandatory) and Proof of Address (like Aadhaar).",
      },
      {
        heading: '4.2 Account Opening Documents',
        body:
          'A Power of Attorney (PoA) is an optional document. A newer, safer alternative is the DDPI (Demat Debit and Pledge Instruction).',
      },
      {
        heading: '4.3 Nomination',
        body:
          'Always provide a nominee for your accounts to ensure easy transfer of your securities to your heirs.',
      },
    ],
    quiz: [
      {
        question:
          'Which among the given options is NOT a mandatory requirement for lodging complaints on SCORES?',
        options: ['e-mail address', 'Name & address', 'Aadhaar Number', 'PAN'],
        answer: 'Aadhaar Number',
      },
      {
        question: 'What is the purpose of a Unique Client Code (UCC)?',
        options: [
          'It will enable accessing the stock exchange trading details',
          'It will facilitate arbitration opportunities',
          'It will permit to trade on the stock exchange platform',
          'It will help to track the trading screen of the stock exchange',
        ],
        answer: 'It will permit to trade on the stock exchange platform',
      },
    ],
  },
  // Module 5
  {
    level: 2,
    title: 'Module 5: The Primary Market - Investing in New Issues 🆕',
    content: [
      {
        heading: '5.1 Deep Dive into IPOs',
        body:
          "An IPO is when a company sells shares to the public for the first time. Before investing, read the Offer Document (Prospectus). Price can be set via a 'Fixed Price' method or a 'Book Building' method (bidding in a price band).",
      },
      {
        heading: '5.2 How to Apply for an IPO',
        body:
          "Applications are made via ASBA (Application Supported by Blocked Amount). The application amount is blocked in your bank account, not debited, until allotment. Retail investors can also use their UPI ID.",
      },
      {
        heading: '5.3 Introduction to Rights Issues',
        body:
          'A rights issue is an offer to existing shareholders to buy additional shares. Shareholders receive Rights Entitlements (REs) which they can use to apply, sell on the market, or let lapse.',
      },
    ],
    quiz: [
      {
        question:
          'In a Book Building IPO, what is the term for the final price at which securities are issued to the public?',
        options: ['Floor Price', 'Cap Price', 'Cut-off Price', 'Face Value'],
        answer: 'Cut-off Price',
      },
      {
        question:
          'What does ASBA, the mandatory application process for public issues, stand for?',
        options: [
          "Application Supported by Broker's Amount",
          'Allotment Supported by Blocked Amount',
          'Application Supported by Blocked Amount',
          "Allotment System for Broker's Application",
        ],
        answer: 'Application Supported by Blocked Amount',
      },
    ],
  },
  // Module 6
  {
    level: 2,
    title: 'Module 6: The Secondary Market - Buying & Selling Shares 📈',
    content: [
      {
        heading: '6.1 How to Place an Order',
        body:
          "You can place buy/sell orders through your broker's website, app, or by phone. The 'Market Watch' screen shows real-time data like Last Traded Price (LTP), volume, and pending orders.",
      },
      {
        heading: '6.2 Types of Orders',
        body:
          "A 'Market Order' executes immediately at the current price. A 'Limit Order' executes only at a specific price or better. A 'Stop-Loss Order' is used to limit potential losses.",
      },
      {
        heading: '6.3 Post-Trade Process',
        body:
          'Within 24 hours, you must receive a Contract Note from your broker. The market follows a T+1 Settlement cycle (settlement on the next working day). Always verify that shares are credited to your demat account.',
      },
    ],
    quiz: [
      {
        question: 'What is a contract note?',
        options: [
          'It is evidence of trade done by the stock broker on behalf of the client',
          'It is evidence of trade done by the client',
          'It is evidence of trade done by the stock broker on his own account',
          'It is an agreement between the stock broker and the stock exchange',
        ],
        answer:
          'It is evidence of trade done by the stock broker on behalf of the client',
      },
      {
        question:
          'A type of order that allows one to buy or sell a contract as soon as it is released, and if it does not find a match, is immediately removed from the system is called...',
        options: [
          'Good Till Cancelled order',
          'Day order',
          'Immediate or Cancel order',
          'End of session order',
        ],
        answer: 'Immediate or Cancel order',
      },
    ],
  },
  // Module 7
  {
    level: 3,
    title: 'Module 7: Advanced Due Diligence & Analysis 📊',
    content: [
      {
        heading: '7.1 Fundamental Analysis',
        body:
          "This involves evaluating a company's financial health to determine its intrinsic value. It requires reviewing financial statements and key ratios like Price to Earnings (P/E) Ratio and Earnings Per Share (EPS).",
      },
      {
        heading: '7.2 Portfolio Diversification & Asset Allocation',
        body:
          'Diversification is reducing risk by investing in a variety of assets. Asset Allocation is dividing your portfolio among different categories (equity, debt, gold) based on your goals and risk tolerance.',
      },
      {
        heading: '7.3 Introduction to Technical Analysis',
        body:
          'Technical analysis forecasts price direction by studying past market data, primarily price and volume. It uses tools like charts and indicators to identify trends. It does not guarantee future results.',
      },
    ],
    quiz: [
      {
        question:
          'Technical analysis involves forecasting of future price movements based on...',
        options: [
          'demand & supply situation',
          'behavioural study of historical price movement',
          'expert analysis of price movements',
          'perception of traders and clients',
        ],
        answer: 'behavioural study of historical price movement',
      },
      {
        question: 'What is cartelisation in the context of a market?',
        options: [
          'A group of traders who control supply and manipulate price in their favour',
          'When buyers and sellers negotiate the price freely',
          'A group of buyers who manipulate the price downwards',
          'A group of sellers who compete to lower the price',
        ],
        answer:
          'A group of traders who control supply and manipulate price in their favour',
      },
    ],
  },
  // Module 8
  {
    level: 3,
    title: 'Module 8: Advanced Trading & Risk Management ⚙️',
    content: [
      {
        heading: '8.1 Margin Trading & Leverage',
        body:
          'Margin trading allows you to use leverage (borrowed funds) to trade with more capital than you have. This magnifies both potential profits and losses. You can provide margin by pledging your shares, which remain in your demat account.',
      },
      {
        heading: '8.2 Introduction to Derivatives (F&O)',
        body:
          'Derivatives are contracts whose value is derived from an underlying asset. Futures are an agreement to buy/sell at a future date. Options give the buyer the right, but not the obligation, to buy (Call) or sell (Put) an asset.',
      },
      {
        heading: '8.3 Algorithmic & High-Frequency Trading (HFT)',
        body:
          'Algorithmic Trading uses computer programs to execute trades automatically. High-Frequency Trading (HFT) is a type of algo trading that operates at extremely high speeds. These are highly regulated by SEBI.',
      },
    ],
    quiz: [
      {
        question:
          'The process of marking futures contracts to market daily means...',
        options: [
          'The profitability of the contract is locked from the onset.',
          'The amount of commodity to be delivered changes as price changes.',
          'The profit and losses are to be debited/credited daily.',
          'The contracts are closed out as soon as they become unprofitable.',
        ],
        answer: 'The profit and losses are to be debited/credited daily',
      },
      {
        question: 'What is the correct definition of a call option?',
        options: [
          'A contract that gives the holder the right, but not the obligation, to buy an underlying asset at a specified price within a specific time period.',
          'A contract that gives the holder the obligation to buy an underlying asset at a specified price.',
          'A contract that gives the holder the right, but not the obligation, to sell an underlying asset at a specified price.',
          'A contract that is traded only in Europe.',
        ],
        answer:
          'A contract that gives the holder the right, but not the obligation, to buy an underlying asset at a specified price within a specific time period.',
      },
    ],
  },
  // Module 9
  {
    level: 3,
    title: 'Module 9: Investor Protection & Grievance Redressal 🛡️',
    content: [
      {
        heading: '9.1 Investor Charters',
        body:
          "SEBI and market intermediaries have published 'Investor Charters' which clearly outline the services you can expect, timelines, and your rights and responsibilities as an investor.",
      },
      {
        heading: '9.2 Avoiding Fraud',
        body:
          'Be wary of schemes promising abnormally high or consistent returns with little risk—these are red flags for Ponzi schemes. Always deal only with SEBI-registered intermediaries. You can verify their registration on the SEBI website.',
      },
      {
        heading: '9.3 Grievance Redressal Mechanism',
        body:
          "If you have a complaint, first approach the concerned company/intermediary. If unresolved, you can lodge a complaint on SEBI's online portal, SCORES (SEBI Complaints REdress System). You can also use SEBI's Toll-Free Helpline (1800 266 7575).",
      },
    ],
    quiz: [
      {
        question:
          "What is the purpose of the Investor Protection Fund (IPF) set up by stock exchanges under SEBI's guidance?",
        options: [
          'Creating awareness and educating the general public about the benefits of trading.',
          'To fulfil corporate social responsibilities (CSR).',
          'To redress the grievances of the investors.',
          'To compensate legitimate claims of investors against a defaulting member.',
        ],
        answer:
          'To compensate legitimate claims of investors against a defaulting member.',
      },
      {
        question:
          'A party aggrieved by an appellate arbitral award may file an application to the...',
        options: ['Court of Law', 'SEBI', 'Stock Exchange', 'Clearing Corporation'],
        answer: 'Court of Law',
      },
    ],
  },
];


// --- Fix for robust string comparison ---
const normalize = (s) =>
  (s ?? '')
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,?!;:"'(){}\[\]]/g, '')
    .toLowerCase();


// --- Certificate Screen Component from first code ---
const CertificateView = ({ onRestart, onDownload }) => {
  return (
    <View style={styles.certificateWrap}>
      <Animatable.Text animation="zoomIn" duration={600} style={styles.cerTitle}>
        🎉 Congratulations!
      </Animatable.Text>
      <Text style={styles.cerSubtitle}>You’ve completed the SEBI Learning Course</Text>

      <View style={styles.cerCard}>
        <Text style={styles.cerHeading}>Certificate of Completion</Text>
        <Text style={styles.cerBody}>
          This certifies that the learner has completed all modules and passed the
          assessments of the SEBI Interactive Learning App.
        </Text>
        <Text style={styles.cerFooter}>Date: {new Date().toDateString()}</Text>
      </View>

      <View style={styles.cerButtonsRow}>
        <TouchableOpacity style={styles.navButton} onPress={onDownload}>
          <Text style={styles.navButtonText}>Download PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navButton, { backgroundColor: '#0ea5e9' }]} onPress={onRestart}>
          <Text style={styles.navButtonText}>Restart Course</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


// --- Main LearningModulesScreen Component ---
class LearningModulesScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // The new way to manage state for this combined component
      completedModules: {}, // Stores which modules have been completed
      isLoadedFromStorage: false,
    };
  }

  // Load completion status from AsyncStorage
  async componentDidMount() {
    try {
      const savedStatus = await AsyncStorage.getItem('completedModules');
      if (savedStatus !== null) {
        this.setState({ completedModules: JSON.parse(savedStatus) });
      }
    } catch (e) {
      // ignore load errors
    } finally {
      this.setState({ isLoadedFromStorage: true });
    }
  }

  // Function to save completion status
  async saveCompletionStatus(moduleId) {
    const updatedStatus = { ...this.state.completedModules, [moduleId]: true };
    this.setState({ completedModules: updatedStatus });
    try {
      await AsyncStorage.setItem('completedModules', JSON.stringify(updatedStatus));
    } catch (e) {
      // ignore save errors
    }
  }

  // Handle module navigation and completion logic
  handleModulePress = (module) => {
    // Navigate to a detail screen for this module
    this.props.navigation.navigate('ModuleDetail', {
      moduleData: module,
      // Pass a callback function to mark a module as completed
      onModuleComplete: (moduleId) => this.saveCompletionStatus(moduleId),
    });
  };

  handleDownloadCertificate = async () => {
    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Roboto, "Segoe UI", Arial; padding: 40px; color:#0f172a; }
          .box { border: 3px solid #1e3a8a; padding: 32px; border-rdius: 16px; text-align: center; }
          h1 { color: #1e3a8a; }
          h2 { color: #334155; margin-top:0 }
          p { font-size: 16px; line-height: 1.6; }
          .meta { margin-top: 24px; }
          .stamp { margin-top: 28px; font-weight: 600;}
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Certificate of Completion</h1>
          <h2>SEBI Interactive Learning App</h2>
          <p>This certificate is awarded for successfully completing all modules and passing the assessments.</p>
          <div class="meta">
            <strong>Date:</strong> ${new Date().toDateString()}
          </div>
          <div class="stamp">✔ Verified Completion</div>
        </div>
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Certificate' });
      } else {
        Alert.alert('Saved', `PDF saved to: ${uri}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to generate the certificate.');
    }
  };

  // Function to render each module item in the list
  renderModuleItem = ({ item, index }) => {
    const isCompleted = this.state.completedModules[item.title]; // Use title as key
    const isNextModule = index > 0 && this.state.completedModules[appData[index - 1].title];
    const isDisabled = index > 0 && !isNextModule && !this.state.completedModules[appData[index - 1].title];

    return (
      <TouchableOpacity
        style={[styles.moduleCard, isDisabled && styles.disabledCard]}
        onPress={() => this.handleModulePress(item)}
        disabled={isDisabled}
      >
        <Text style={styles.moduleIcon}>{item.level}</Text>
        <View style={styles.moduleInfo}>
          <Text style={styles.moduleTitle}>{item.title}</Text>
          <Text style={styles.moduleDescription}>
            {item.content[0].body.substring(0, 70)}...
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              {item.level === 1 ? 'Beginner' : item.level === 2 ? 'Intermediate' : 'Advanced'}
            </Text>
          </View>
        </View>
        {isCompleted && (
          <View style={styles.completionBadge}>
            <Text style={styles.completionText}>✅</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  render() {
    const { completedModules, isLoadedFromStorage } = this.state;
    if (!isLoadedFromStorage) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading…</Text>
          </View>
        </SafeAreaView>
      );
    }

    const completedCount = Object.keys(completedModules).length;
    const totalModules = appData.length;
    const progress = completedCount / totalModules;
    const allModulesCompleted = completedCount === totalModules;

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} />

        {/* Progress Bar and Title */}
        <View style={styles.progressWrap}>
          <Text style={styles.headerTitle}>Interactive Learning Modules</Text>
          <Progress.Bar
            progress={progress}
            width={null}
            height={8}
            color="#2563eb"
            unfilledColor="#e2e8f0"
            borderWidth={0}
            borderRadius={6}
          />
          <Text style={styles.progressText}>
            {`Progress: ${completedCount} / ${totalModules} Modules`}
          </Text>
        </View>

        {/* Main Content Area */}
        {allModulesCompleted ? (
          <CertificateView
            onRestart={() => this.setState({ completedModules: {} })}
            onDownload={this.handleDownloadCertificate}
          />
        ) : (
          <FlatList
            data={appData}
            renderItem={this.renderModuleItem}
            keyExtractor={(item) => item.title}
            contentContainerStyle={styles.listContentContainer}
          />
        )}
      </SafeAreaView>
    );
  }
}

// --- Styles from both codes, merged and prioritized ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  progressWrap: {
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    color: '#475569',
    textAlign: 'right',
  },
  listContentContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  moduleCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    backgroundColor: '#e2e8f0',
  },
  moduleIcon: {
    fontSize: 30,
    marginRight: 15,
    color: '#1e3a8a',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 13,
    color: '#4a5568',
  },
  levelBadge: {
    backgroundColor: '#e0f7fa',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#007bff',
  },
  completionBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  completionText: {
    fontSize: 20,
  },
  certificateWrap: {
    flex: 1,
    padding: 16,
    paddingTop: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  cerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2563eb',
    textAlign: 'center',
  },
  cerSubtitle: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  cerCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  cerHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 10,
  },
  cerBody: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 22,
    textAlign: 'center',
  },
  cerFooter: {
    marginTop: 14,
    textAlign: 'right',
    color: '#475569',
  },
  cerButtonsRow: {
    width: '100%',
    gap: 10,
    marginTop: 10,
  },
  navButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LearningModulesScreen;