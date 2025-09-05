import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_PROGRESS_STORAGE_KEY } from '../constants';
import * as Animatable from 'react-native-animatable';

// --- Data Store for all Modules and Quizzes (Including video content now) ---
// This data will be part of the app itself. We'll use a local copy for this screen.
const appData = [
  // Module 1 (Updated with a placeholder video)
  {
    level: 1,
    title: 'Module 1: Why Invest? The Basics of Personal Finance 📚',
    content: [
      {
        heading: '1.1 Savings vs. Investing',
        body: "Savings is the portion of your income not used for expenses. It's typically kept in a bank account, where it's safe and highly liquid but earns low interest. Savings are for short-term goals or emergencies.\n\nInvesting is setting your money aside in various products with the expectation that it will grow over a longer period. Investments carry risk but have the potential to earn much more than a savings account, helping you achieve long-term goals.",
      },
      {
        heading: '1.2 The Power of Compounding 📈',
        body: "Compounding is the process where your investment grows exponentially because you earn returns not just on your initial principal but also on the accumulated earnings. Starting early is key. The 'Rule of 72' is a simple way to estimate how long it will take for an investment to double. Just divide 72 by the annual interest rate.",
      },
      {
        heading: '1.3 The Impact of Inflation 💨',
        body: "Inflation is the rise in prices over time. As prices increase, the purchasing power of your money goes down. Your financial plan must aim to earn returns that are higher than the rate of inflation. If your investment earns 7% but inflation is 6%, your 'real rate of return' is only 1%.",
      },
      {
        heading: '1.4 The Concept of Risk and Return ⚖️',
        body: 'Risk and return go hand in hand. Risk is the chance of losing some or all of the money you\'ve invested. Return is the potential reward you get for taking that risk. The fundamental rule is: the higher the potential return, the higher the risk.',
      },
      {
        heading: '1.5 SMART Financial Goals 🎯',
        body: "A good financial goal should be SMART: Specific, Measurable, Achievable, Realistic, and Time-bound. For example, 'I will save ₹50,000 every year for the next 10 years for my daughter's marriage.'",
      },
    ],
    videoEmbedId: 'M7lc1UVf-VE', // Example from your previous code
    quiz: [
      {
        question: 'What is the primary effect of inflation on your savings?',
        options: ['It increases the interest rate earned on your savings.', 'It decreases the purchasing power of your money.', 'It guarantees a positive real rate of return.', 'It has no effect on the value of money.'],
        answer: 'It decreases the purchasing power of your money.',
      },
      {
        question: "The 'Rule of 72' is a simple way to estimate...",
        options: ['The amount of tax you will pay on your investment.', 'The monthly EMI for a loan.', 'How long it will take for an investment to double in value.', 'The amount of risk in a portfolio.'],
        answer: 'How long it will take for an investment to double in value.',
      },
    ],
  },
  {
    level: 1,
    title: 'Module 2: Introduction to the Indian Securities Market 🏛️',
    content: [
      {
        heading: '2.1 What is a Securities Market?',
        body: 'The securities market is the mechanism that brings together suppliers of capital (investors) and users of capital (companies). It mobilizes savings and channels them into productive ventures.',
      },
      {
        heading: '2.2 The Market Regulator: SEBI',
        body: 'The Securities and Exchange Board of India (SEBI) is the regulator for the securities market in India. Its key mandates are to protect investors, promote market development, and regulate the market.',
      },
      {
        heading: '2.3 Market Structure and Participants',
        body: 'Key participants include: Stock Exchanges (BSE, NSE), Clearing Corporations, Depositories (NSDL, CDSL), Companies (Issuers), Investors, and Intermediaries (like Stock Brokers).',
      },
      {
        heading: '2.4 Primary vs. Secondary Markets',
        body: 'The Primary Market is where securities are issued for the first time (e.g., an IPO). The Secondary Market is where already-issued securities are traded among investors, providing liquidity.',
      },
    ],
    videoEmbedId: null, // This module has no video
    quiz: [
      {
        question: 'Who regulates the commodity derivatives market in India?',
        options: ['RBI', 'IRDAI', 'PFRDA', 'SEBI'],
        answer: 'SEBI',
      },
      {
        question: 'Which among the given options is a key mandate for SEBI?',
        options: ['Regulation of securities market', 'Protect the interest of investors', 'Promote the development of securities market', 'All the three'],
        answer: 'All the three',
      },
    ],
  },
  {
    level: 1,
    title: 'Module 3: Your First Steps into the Market 🚀',
    content: [
      {
        heading: '3.1 Pre-requisites for Investing',
        body: 'To trade, you need three accounts: a Savings Bank Account, a Trading Account with a stock broker, and a Demat Account with a Depository Participant (DP) to hold securities electronically.',
      },
      {
        heading: '3.2 What Can You Invest In?',
        body: 'You can invest in Equity Shares (ownership), Debt Instruments (loans like bonds), Mutual Funds (pooled investments), and Commodity Derivatives (contracts on goods like gold).',
      },
      {
        heading: '3.3 Your Rights as a Shareholder 📜',
        body: "As a part-owner, you have the right to receive dividends, get the company's Annual Report, attend meetings, and vote on key corporate decisions.",
      },
    ],
    videoEmbedId: null,
    quiz: [
      {
        question: 'Which among the given options is a prerequisite for starting trading in the commodity derivatives market?',
        options: ['Opening a Trading Account with a SEBI registered stock broker and completing the process of Know Your Client (KYC)', 'Should be trading in the physical market', 'Should have adequate stock in a warehouse/designated vault', 'Should have experience of trading on a Regional exchange platform'],
        answer: 'Opening a Trading Account with a SEBI registered stock broker and completing the process of Know Your Client (KYC)',
      },
      {
        question: 'Hedging is a price risk management mechanism used by stakeholders who have...',
        options: ['little or no exposure to the physical commodity', 'an exposure to the financial market', 'an exposure to the physical commodity', 'none of these'],
        answer: 'an exposure to the physical commodity',
      },
    ],
  },
  {
    level: 2,
    title: 'Module 4: Getting Started - Accounts & KYC 📝',
    content: [
      {
        heading: '4.1 Opening Accounts & KYC',
        body: "To open accounts, you must complete the KYC (Know Your Client) process. You'll need Proof of Identity (PAN card is mandatory) and Proof of Address (like Aadhaar).",
      },
      {
        heading: '4.2 Account Opening Documents',
        body: 'A Power of Attorney (PoA) is an optional document. A newer, safer alternative is the DDPI (Demat Debit and Pledge Instruction).',
      },
      {
        heading: '4.3 Nomination',
        body: 'Always provide a nominee for your accounts to ensure easy transfer of your securities to your heirs.',
      },
    ],
    videoEmbedId: null,
    quiz: [
      {
        question: 'Which among the given options is NOT a mandatory requirement for lodging complaints on SCORES?',
        options: ['e-mail address', 'Name & address', 'Aadhaar Number', 'PAN'],
        answer: 'Aadhaar Number',
      },
      {
        question: 'What is the purpose of a Unique Client Code (UCC)?',
        options: ['It will enable accessing the stock exchange trading details', 'It will facilitate arbitration opportunities', 'It will permit to trade on the stock exchange platform', 'It will help to track the trading screen of the stock exchange'],
        answer: 'It will permit to trade on the stock exchange platform',
      },
    ],
  },
  {
    level: 2,
    title: 'Module 5: The Primary Market - Investing in New Issues 🆕',
    content: [
      {
        heading: '5.1 Deep Dive into IPOs',
        body: "An IPO is when a company sells shares to the public for the first time. Before investing, read the Offer Document (Prospectus). Price can be set via a 'Fixed Price' method or a 'Book Building' method (bidding in a price band).",
      },
      {
        heading: '5.2 How to Apply for an IPO',
        body: "Applications are made via ASBA (Application Supported by Blocked Amount). The application amount is blocked in your bank account, not debited, until allotment. Retail investors can also use their UPI ID.",
      },
      {
        heading: '5.3 Introduction to Rights Issues',
        body: 'A rights issue is an offer to existing shareholders to buy additional shares. Shareholders receive Rights Entitlements (REs) which they can use to apply, sell on the market, or let lapse.',
      },
    ],
    videoEmbedId: null,
    quiz: [
      {
        question: 'In a Book Building IPO, what is the term for the final price at which securities are issued to the public?',
        options: ['Floor Price', 'Cap Price', 'Cut-off Price', 'Face Value'],
        answer: 'Cut-off Price',
      },
      {
        question: 'What does ASBA, the mandatory application process for public issues, stand for?',
        options: ["Application Supported by Broker's Amount", 'Allotment Supported by Blocked Amount', 'Application Supported by Blocked Amount', "Allotment System for Broker's Application"],
        answer: 'Application Supported by Blocked Amount',
      },
    ],
  },
  {
    level: 2,
    title: 'Module 6: The Secondary Market - Buying & Selling Shares 📈',
    content: [
      {
        heading: '6.1 How to Place an Order',
        body: "You can place buy/sell orders through your broker's website, app, or by phone. The 'Market Watch' screen shows real-time data like Last Traded Price (LTP), volume, and pending orders.",
      },
      {
        heading: '6.2 Types of Orders',
        body: "A 'Market Order' executes immediately at the current price. A 'Limit Order' executes only at a specific price or better. A 'Stop-Loss Order' is used to limit potential losses.",
      },
      {
        heading: '6.3 Post-Trade Process',
        body: 'Within 24 hours, you must receive a Contract Note from your broker. The market follows a T+1 Settlement cycle (settlement on the next working day). Always verify that shares are credited to your demat account.',
      },
    ],
    videoEmbedId: null,
    quiz: [
      {
        question: 'What is a contract note?',
        options: ['It is evidence of trade done by the stock broker on behalf of the client', 'It is evidence of trade done by the client', 'It is evidence of trade done by the stock broker on his own account', 'It is an agreement between the stock broker and the stock exchange'],
        answer: 'It is evidence of trade done by the stock broker on behalf of the client',
      },
      {
        question: 'A type of order that allows one to buy or sell a contract as soon as it is released, and if it does not find a match, is immediately removed from the system is called...',
        options: ['Good Till Cancelled order', 'Day order', 'Immediate or Cancel order', 'End of session order'],
        answer: 'Immediate or Cancel order',
      },
    ],
  },
  {
    level: 3,
    title: 'Module 7: Advanced Due Diligence & Analysis 📊',
    content: [
      {
        heading: '7.1 Fundamental Analysis',
        body: "This involves evaluating a company's financial health to determine its intrinsic value. It requires reviewing financial statements and key ratios like Price to Earnings (P/E) Ratio and Earnings Per Share (EPS).",
      },
      {
        heading: '7.2 Portfolio Diversification & Asset Allocation',
        body: 'Diversification is reducing risk by investing in a variety of assets. Asset Allocation is dividing your portfolio among different categories (equity, debt, gold) based on your goals and risk tolerance.',
      },
      {
        heading: '7.3 Introduction to Technical Analysis',
        body: 'Technical analysis forecasts price direction by studying past market data, primarily price and volume. It uses tools like charts and indicators to identify trends. It does not guarantee future results.',
      },
    ],
    videoEmbedId: null,
    quiz: [
      {
        question: 'Technical analysis involves forecasting of future price movements based on...',
        options: ['demand & supply situation', 'behavioural study of historical price movement', 'expert analysis of price movements', 'perception of traders and clients'],
        answer: 'behavioural study of historical price movement',
      },
      {
        question: 'What is cartelisation in the context of a market?',
        options: ['A group of traders who control supply and manipulate price in their favour', 'When buyers and sellers negotiate the price freely', 'A group of buyers who manipulate the price downwards', 'A group of sellers who compete to lower the price'],
        answer: 'A group of traders who control supply and manipulate price in their favour',
      },
    ],
  },
  {
    level: 3,
    title: 'Module 8: Advanced Trading & Risk Management ⚙️',
    content: [
      {
        heading: '8.1 Margin Trading & Leverage',
        body: 'Margin trading allows you to use leverage (borrowed funds) to trade with more capital than you have. This magnifies both potential profits and losses. You can provide margin by pledging your shares, which remain in your demat account.',
      },
      {
        heading: '8.2 Introduction to Derivatives (F&O)',
        body: 'Derivatives are contracts whose value is derived from an underlying asset. Futures are an agreement to buy/sell at a future date. Options give the buyer the right, but not the obligation, to buy (Call) or sell (Put) an asset.',
      },
      {
        heading: '8.3 Algorithmic & High-Frequency Trading (HFT)',
        body: 'Algorithmic Trading uses computer programs to execute trades automatically. High-Frequency Trading (HFT) is a type of algo trading that operates at extremely high speeds. These are highly regulated by SEBI.',
      },
    ],
    videoEmbedId: null,
    quiz: [
      {
        question: 'The process of marking futures contracts to market daily means...',
        options: ['The profitability of the contract is locked from the onset.', 'The amount of commodity to be delivered changes as price changes.', 'The profit and losses are to be debited/credited daily.', 'The contracts are closed out as soon as they become unprofitable.'],
        answer: 'The profit and losses are to be debited/credited daily',
      },
      {
        question: 'What is the correct definition of a call option?',
        options: ['A contract that gives the holder the right, but not the obligation, to buy an underlying asset at a specified price within a specific time period.', 'A contract that gives the holder the obligation to buy an underlying asset at a specified price.', 'A contract that gives the holder the right, but not the obligation, to sell an underlying asset at a specified price.', 'A contract that is traded only in Europe.'],
        answer: 'A contract that gives the holder the right, but not the obligation, to buy an underlying asset at a specified price within a specific time period.',
      },
    ],
  },
  {
    level: 3,
    title: 'Module 9: Investor Protection & Grievance Redressal 🛡️',
    content: [
      {
        heading: '9.1 Investor Charters',
        body: "SEBI and market intermediaries have published 'Investor Charters' which clearly outline the services you can expect, timelines, and your rights and responsibilities as an investor.",
      },
      {
        heading: '9.2 Avoiding Fraud',
        body: 'Be wary of schemes promising abnormally high or consistent returns with little risk—these are red flags for Ponzi schemes. Always deal only with SEBI-registered intermediaries. You can verify their registration on the SEBI website.',
      },
      {
        heading: '9.3 Grievance Redressal Mechanism',
        body: "If you have a complaint, first approach the concerned company/intermediary. If unresolved, you can lodge a complaint on SEBI's online portal, SCORES (SEBI Complaints REdress System). You can also use SEBI's Toll-Free Helpline (1800 266 7575).",
      },
    ],
    videoEmbedId: null,
    quiz: [
      {
        question: "What is the purpose of the Investor Protection Fund (IPF) set up by stock exchanges under SEBI's guidance?",
        options: ['Creating awareness and educating the general public about the benefits of trading.', 'To fulfil corporate social responsibilities (CSR).', 'To redress the grievances of the investors.', 'To compensate legitimate claims of investors against a defaulting member.'],
        answer: 'To compensate legitimate claims of investors against a defaulting member.',
      },
      {
        question: 'A party aggrieved by an appellate arbitral award may file an application to the...',
        options: ['Court of Law', 'SEBI', 'Stock Exchange', 'Clearing Corporation'],
        answer: 'Court of Law',
      },
    ],
  },
];


const normalize = (s) => (s ?? '').toString().trim().replace(/\s+/g, ' ').replace(/[.,?!;:"'(){}\[\]]/g, '').toLowerCase();
const { width } = Dimensions.get('window');
const MIN_READ_TIME_SECONDS = 15;

// Reusable component for displaying module content
const ModuleView = ({ module }) => (
  <View>
    {module.content.map((item, index) => (
      <Animatable.View
        key={index}
        animation="fadeInUp"
        delay={150 + index * 80}
        duration={500}
        style={styles.contentCard}
      >
        <Text style={styles.contentHeading}>{item.heading}</Text>
        <Text style={styles.contentText}>{item.body}</Text>
      </Animatable.View>
    ))}
  </View>
);

// Reusable component for the quiz section
const QuizView = ({ module, onAnswer, userAnswers, onReattempt }) => {
  const quizAttempted = Object.keys(userAnswers).length === module.quiz.length;
  const allCorrect = quizAttempted && Object.values(userAnswers).every((ans) => ans.isCorrect);

  return (
    <View style={styles.quizContainer}>
      <Text style={styles.quizTitle}>Module Quiz 🧠</Text>
      {module.quiz.map((q, qIndex) => {
        const answerState = userAnswers[qIndex];
        return (
          <Animatable.View
            key={qIndex}
            animation="fadeInUp"
            delay={100 + qIndex * 80}
            duration={450}
            style={styles.questionCard}
          >
            <Text style={styles.questionText}>{`${qIndex + 1}. ${q.question}`}</Text>
            {q.options.map((option, oIndex) => {
              const buttonStyle = [styles.optionButton];
              const textStyle = [styles.optionText];
              
              if (answerState) {
                if (normalize(option) === normalize(q.answer)) {
                  buttonStyle.push(styles.correctOption);
                }
                if (normalize(answerState.selected) === normalize(option)) {
                  buttonStyle.push(answerState.isCorrect ? styles.correctOption : styles.incorrectOption);
                  textStyle.push(styles.selectedOptionText);
                }
              }

              return (
                <TouchableOpacity
                  key={oIndex}
                  style={buttonStyle}
                  onPress={() => onAnswer(qIndex, option)}
                  disabled={!!answerState}
                >
                  <Text style={textStyle}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </Animatable.View>
        );
      })}
      {quizAttempted && !allCorrect && (
        <TouchableOpacity style={styles.reattemptButton} onPress={onReattempt}>
          <Text style={styles.navButtonText}>Re-attempt Quiz</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};


function ModuleDetailScreen({ route, navigation }) {
  const { moduleData, onModuleComplete } = route.params;
  const moduleIndex = appData.findIndex(mod => mod.title === moduleData.title);
  const totalModules = appData.length;

  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [timeSpentEnough, setTimeSpentEnough] = useState(false);
  const [videoPlayedEnough, setVideoPlayedEnough] = useState(false);
  const [videoPlayerState, setVideoPlayerState] = useState('unstarted');
  const [playerReady, setPlayerReady] = useState(false);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});

  const scrollViewRef = useRef();
  const playerRef = useRef(null);

  const hasScrollableText = moduleData.content && JSON.stringify(moduleData.content).length > 200;
  const hasVideo = !!moduleData.videoEmbedId;

  const hasQuiz = moduleData.quiz && moduleData.quiz.length > 0;
  const quizAnswered = hasQuiz ? Object.keys(userAnswers).length === moduleData.quiz.length : true;
  const allCorrect = hasQuiz ? Object.values(userAnswers).every(ans => ans.isCorrect) : true;

  useEffect(() => {
    setScrolledToEnd(false);
    setTimeSpentEnough(false);
    setVideoPlayedEnough(false);
    setVideoPlayerState('unstarted');
    setPlayerReady(false);
    setWebViewLoaded(false);
    setUserAnswers({});

    if (hasScrollableText) {
      const timer = setTimeout(() => {
        setTimeSpentEnough(true);
      }, MIN_READ_TIME_SECONDS * 1000);
      return () => clearTimeout(timer);
    } else {
      setTimeSpentEnough(true);
    }
  }, [moduleData.title, hasScrollableText]);

  const handleScroll = (event) => {
    if (!hasScrollableText) return;
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (!scrolledToEnd) {
        setScrolledToEnd(true);
      }
    }
  };

  const onStateChange = useCallback((state) => {
    setVideoPlayerState(state);
    if (state === 'ended') {
      setVideoPlayedEnough(true);
    }
  }, []);

  const onPlayerReady = useCallback(() => {
    setPlayerReady(true);
  }, []);

  const onWebViewLoad = useCallback(() => {
    setWebViewLoaded(true);
  }, []);

  const onWebViewLoadStart = useCallback(() => {
    setWebViewLoaded(false);
  }, []);

  const handleAnswer = (questionIndex, selectedOption) => {
    const isCorrect = normalize(moduleData.quiz[questionIndex].answer) === normalize(selectedOption);
    setUserAnswers(prevState => ({
      ...prevState,
      [questionIndex]: { selected: selectedOption, isCorrect },
    }));
  };

  const handleReattempt = () => {
    setUserAnswers({});
  };

  const isNextButtonEnabled = (hasScrollableText ? scrolledToEnd && timeSpentEnough : true) && (hasVideo ? videoPlayedEnough : true) && (hasQuiz ? allCorrect : true);
  const isPrevButtonEnabled = moduleIndex > 0;

  const handleNext = () => {
    if (!isNextButtonEnabled) {
      Alert.alert(
        "Complete Module",
        "Please engage with all content and answer all quiz questions correctly to proceed."
      );
      return;
    }
    onModuleComplete(moduleData.title);

    if (moduleIndex < totalModules - 1) {
      navigation.replace('ModuleDetail', {
        moduleData: appData[moduleIndex + 1],
        onModuleComplete,
      });
    } else {
      navigation.goBack();
    }
  };

  const handlePrev = () => {
    if (moduleIndex > 0) {
      navigation.replace('ModuleDetail', {
        moduleData: appData[moduleIndex - 1],
        onModuleComplete,
      });
    }
  };

  const showInitialLoadingOverlay = hasVideo && (!playerReady || !webViewLoaded);
  
  return (
    <View style={styles.fullScreenContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animatable.Text animation="fadeInDown" duration={500} style={styles.levelTitle}>
          {moduleData.level === 1 ? 'Beginner Level' : moduleData.level === 2 ? 'Intermediate Level' : 'Advanced Level'}
        </Animatable.Text>
        <Animatable.Text animation="fadeInDown" delay={60} duration={500} style={styles.moduleTitle}>
          {moduleData.title}
        </Animatable.Text>

        {hasVideo && (
          <View style={styles.videoContainer}>
            {showInitialLoadingOverlay && (
              <View style={styles.videoLoaderOverlay}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.videoOverlayText}>
                  {playerReady && webViewLoaded ? "Buffering Video..." : "Loading Video Player..."}
                </Text>
              </View>
            )}
            <YoutubePlayer
              ref={playerRef}
              height={200}
              width={width - 40}
              play={false}
              videoId={moduleData.videoEmbedId}
              onChangeState={onStateChange}
              onReady={onPlayerReady}
              allowsFullscreen={true}
              webViewProps={{
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserAction: false,
                androidHardwareAccelerationDisabled: false,
                javaScriptEnabled: true,
                domStorageEnabled: true,
                onLoad: onWebViewLoad,
                onLoadStart: onWebViewLoadStart,
                style: { backgroundColor: 'black', flex: 1 },
              }}
              origin="https://www.youtube.com"
              forceAndroidAutoplay={false}
              initialPlayerParams={{
                controls: 1,
                rel: 0,
                modestbranding: 1,
                iv_load_policy: 3,
                playsinline: 1,
              }}
              style={{ zIndex: 1 }}
              debug={true}
            />
          </View>
        )}
        
        <ModuleView module={moduleData} />

        {hasQuiz && (
          <QuizView
            module={moduleData}
            onAnswer={handleAnswer}
            userAnswers={userAnswers}
            onReattempt={handleReattempt}
          />
        )}
        <View style={{ height: 50 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, !isPrevButtonEnabled && styles.disabledButton]}
            onPress={handlePrev}
            disabled={!isPrevButtonEnabled}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <Text style={styles.moduleTracker}>
            {`Module ${moduleIndex + 1}/${totalModules}`}
          </Text>

          <TouchableOpacity
            style={[styles.navButton, !isNextButtonEnabled && styles.disabledButton]}
            onPress={handleNext}
            disabled={!isNextButtonEnabled}
          >
            <Text style={styles.navButtonText}>
              {moduleIndex === totalModules - 1 ? 'Finish' : 'Next Module'}
            </Text>
          </TouchableOpacity>
        </View>
        {!isNextButtonEnabled && (
          <Text style={styles.infoText}>
            Please engage with the content and answer all quiz questions correctly to proceed.
          </Text>
        )}
      </View>
    </View>
  );
}


// --- All styles, including from both codes, are merged here ---
const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  levelTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginTop: 20,
  },
  moduleTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 15,
    textAlign: 'center',
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginBottom: 15,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoLoaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  videoOverlayText: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 5,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quizContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#475569',
  },
  correctOption: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  incorrectOption: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  reattemptButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  footer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#dfe4ea',
    paddingBottom: 10,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  navButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  moduleTracker: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
  },
  infoText: {
    textAlign: 'center',
    color: '#ef4444',
    paddingHorizontal: 15,
    paddingBottom: 5,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ModuleDetailScreen;