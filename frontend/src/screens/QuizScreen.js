import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_PROGRESS_STORAGE_KEY } from '../constants';

// --- DATA: A comprehensive set of quiz questions. ---
const QUIZ_DATA = {
  id: 'comprehensive_quiz_beginner',
  title: 'Comprehensive Quiz: Financial Concepts',
  questions: [
    {
      question: "What is the primary purpose of a budget in personal finance?",
      options: [
        { text: "To identify new ways to spend money.", isCorrect: false },
        { text: "To track, plan, and control the inflow and outflow of your income.", isCorrect: true },
        { text: "To quickly multiply your money through high-risk investments.", isCorrect: false },
        { text: "To avoid paying taxes on your earnings.", isCorrect: false },
      ],
      explanation: "A budget is a financial plan that helps you manage your money by tracking income and expenses, ensuring you save for your goals and avoid overspending."
    },
    {
      question: "Which of the following best describes 'inflation'?",
      options: [
        { text: "A decrease in the general price level of goods and services.", isCorrect: false },
        { text: "An increase in the purchasing power of money.", isCorrect: false },
        { text: "A sustained increase in the general price level of goods and services, reducing purchasing power.", isCorrect: true },
        { text: "A sudden drop in stock market prices.", isCorrect: false },
      ],
      explanation: "Inflation erodes the value of money over time, meaning you can buy less with the same amount of money in the future. Investments need to outpace inflation to grow real wealth."
    },
    {
      question: "What is the 'Rule of 72' primarily used to estimate?",
      options: [
        { text: "The number of years to pay off a loan.", isCorrect: false },
        { text: "The time it takes for an investment to double in value.", isCorrect: true },
        { text: "The ideal age to start investing.", isCorrect: false },
        { text: "The amount of interest earned in a single year.", isCorrect: false },
      ],
      explanation: "The Rule of 72 is a quick mental math shortcut to estimate the number of years it takes for an investment to double, by dividing 72 by the annual interest rate."
    },
    {
      question: "In financial terms, what does 'liquidity' refer to?",
      options: [
        { text: "The total amount of debt a person has.", isCorrect: false },
        { text: "The ability of an asset to generate high returns quickly.", isCorrect: false },
        { text: "The ease with which an asset can be converted into cash without significant loss of value.", isCorrect: true },
        { text: "The stability of an investment's value.", isCorrect: false },
      ],
      explanation: "Liquidity is a crucial aspect of investments. Highly liquid assets like cash or savings accounts can be accessed quickly, while illiquid assets like real estate take time to convert to cash."
    },
    {
      question: "What is the main advantage of 'compounding' in investments?",
      options: [
        { text: "It ensures that you never lose money.", isCorrect: false },
        { text: "It allows you to earn returns on both your initial investment and previously earned returns.", isCorrect: true },
        { text: "It simplifies the investment process for beginners.", isCorrect: false },
        { text: "It reduces the amount of tax you pay on your earnings.", isCorrect: false },
      ],
      explanation: "Compounding is often called the 'eighth wonder of the world' because it accelerates wealth growth by reinvesting earnings, causing your money to grow exponentially over time."
    },
  {
    question: "What is the primary role of SEBI (Securities and Exchange Board of India)?",
    options: [
      { text: "To manage all public sector banks in India.", isCorrect: false },
      { text: "To protect the interests of investors and regulate the Indian securities market.", isCorrect: true },
      { text: "To issue new currency notes and control inflation.", isCorrect: false },
      { text: "To provide direct loans to companies for expansion.", isCorrect: false },
    ],
    explanation: "SEBI is the apex regulator for the Indian securities market, mandated to protect investors, promote market development, and regulate market participants and activities to ensure fairness and transparency."
  },
  {
    question: "Which document is generally mandatory for opening a bank account in India?",
    options: [
      { text: "A ration card.", isCorrect: false },
      { text: "A PAN (Permanent Account Number) card.", isCorrect: true },
      { text: "A library membership card.", isCorrect: false },
      { text: "A vehicle registration certificate.", isCorrect: false },
    ],
    explanation: "PAN card is a mandatory document for financial transactions in India, including opening bank accounts, due to KYC (Know Your Customer) regulations designed to prevent money laundering."
  },
  {
    question: "What does 'EMI' stand for in the context of loans?",
    options: [
      { text: "Extra Money Invested.", isCorrect: false },
      { text: "Equated Monthly Installment.", isCorrect: true },
      { text: "Emergency Money Insurance.", isCorrect: false },
      { text: "Early Maturity Incentive.", isCorrect: false },
    ],
    explanation: "EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. It covers both principal and interest."
  },
  {
    question: "What is a 'Demat account' primarily used for?",
    options: [
      { text: "Holding physical share certificates securely.", isCorrect: false },
      { text: "Making cash deposits and withdrawals at ATMs.", isCorrect: false },
      { text: "Holding shares and other securities in electronic form.", isCorrect: true },
      { text: "Trading in foreign currency.", isCorrect: false },
    ],
    explanation: "A Demat (dematerialized) account allows investors to hold securities like shares, bonds, and mutual fund units in an electronic format, eliminating the need for physical certificates and facilitating online trading."
  },
  {
    question: "What is the main risk associated with using a credit card if not managed properly?",
    options: [
      { text: "Guaranteed high returns on purchases.", isCorrect: false },
      { text: "The risk of overspending and accumulating high-interest debt.", isCorrect: true },
      { text: "Automatic investment in the stock market.", isCorrect: false },
      { text: "Lowering your overall tax liability.", isCorrect: false },
    ],
    explanation: "While convenient, credit cards can lead to significant debt if balances are not paid in full by the due date, as high interest rates can quickly accumulate on outstanding amounts."
  },
  {
    question: "What is the purpose of 'diversification' in an investment portfolio?",
    options: [
      { text: "To concentrate all investments in a single, high-growth asset.", isCorrect: false },
      { text: "To reduce risk by spreading investments across various asset classes and securities.", isCorrect: true },
      { text: "To ensure a fixed and guaranteed return on all investments.", isCorrect: false },
      { text: "To simplify the process of tracking market movements.", isCorrect: false },
    ],
    explanation: "Diversification is a strategy to minimize risk by investing in a variety of assets. This way, if one investment performs poorly, it doesn't severely impact the entire portfolio."
  },
  {
    question: "What does a 'crossed cheque' with 'A/C payee only' written on it signify?",
    options: [
      { text: "The cheque can be cashed by anyone at any bank branch.", isCorrect: false },
      { text: "The cheque can only be deposited into the bank account of the named payee.", isCorrect: true },
      { text: "The cheque is invalid and cannot be processed.", isCorrect: false },
      { text: "The cheque can only be used for international transactions.", isCorrect: false },
    ],
    explanation: "This specific type of crossing ensures that the funds from the cheque can only be credited to the bank account of the person or entity named as the payee, adding a layer of security."
  },
  {
    question: "Who is considered the 'owner' of a company in proportion to their investment?",
    options: [
      { text: "A debenture holder.", isCorrect: false },
      { text: "A bondholder.", isCorrect: false },
      { text: "A shareholder.", isCorrect: true },
      { text: "A bank that provides a loan to the company.", isCorrect: false },
    ],
    explanation: "Shareholders are the part-owners of a company. By purchasing shares, they gain ownership rights, including a claim on the company's assets and earnings, and typically voting rights."
  },
  {
    question: "What is a 'mutual fund'?",
    options: [
      { text: "A single, high-risk investment in a new startup company.", isCorrect: false },
      { text: "A collective investment vehicle that pools money from many investors to invest in a diversified portfolio of securities.", isCorrect: true },
      { text: "A government scheme that guarantees fixed returns.", isCorrect: false },
      { text: "A type of insurance policy.", isCorrect: false },
    ],
    explanation: "Mutual funds are professionally managed investment funds that gather money from numerous investors to buy a diverse range of securities, offering diversification and expert management even for small investments."
  },
  {
    question: "What is the primary purpose of the 'primary market' in the securities industry?",
    options: [
      { text: "For investors to trade existing securities among themselves.", isCorrect: false },
      { text: "For companies to raise new capital by issuing securities to the public for the first time.", isCorrect: true },
      { text: "To resolve disputes between investors and brokers.", isCorrect: false },
      { text: "To provide a platform for commodity trading.", isCorrect: false },
    ],
    explanation: "The primary market is where new securities are issued. Companies use this market (e.g., through IPOs) to raise fresh capital directly from investors to fund their operations or expansion projects."
  },
  {
    question: "What does a 'bull market' typically signify?",
    options: [
      { text: "A period of economic recession and falling stock prices.", isCorrect: false },
      { text: "A market where investors are pessimistic and expect prices to decline.", isCorrect: false },
      { text: "A market characterized by optimism and rising stock prices.", isCorrect: true },
      { text: "A market with stable prices and low trading volume.", isCorrect: false },
    ],
    explanation: "A bull market is a financial market where prices are rising or are expected to rise. It's characterized by investor optimism, confidence, and strong economic growth."
  },
  {
    question: "What is a 'Dividend' paid by a company?",
    options: [
      { text: "A loan provided by the company to its shareholders.", isCorrect: false },
      { text: "A fee charged by the company for holding its shares.", isCorrect: false },
      { text: "A portion of the company's profits distributed to its shareholders.", isCorrect: true },
      { text: "A type of tax levied on company earnings.", isCorrect: false },
    ],
    explanation: "Dividends are payments made by a corporation to its shareholders, usually as a distribution of profits. They can be paid in cash or as additional shares."
  },
  {
    question: "What is the 'KYC' (Know Your Customer) process in banking and finance primarily intended for?",
    options: [
      { text: "To determine a customer's credit score.", isCorrect: false },
      { text: "To enable financial institutions to understand and verify their customers' identities and activities.", isCorrect: true },
      { text: "To track a customer's daily spending habits for marketing purposes.", isCorrect: false },
      { text: "To guarantee a customer's eligibility for all banking products.", isCorrect: false },
    ],
    explanation: "KYC is a mandatory process for financial institutions to verify the identity of their clients. It's crucial for preventing fraud, money laundering, and terrorist financing."
  },
  {
    question: "Why is it generally not advisable to keep a large amount of cash at home?",
    options: [
      { text: "It is illegal in most countries.", isCorrect: false },
      { text: "It is unsafe due to risks of theft or loss, and it loses potential earnings from interest or investment.", isCorrect: true },
      { text: "It causes inflation.", isCorrect: false },
      { text: "Banks will charge a fee for not depositing it.", isCorrect: false },
    ],
    explanation: "Keeping large sums of cash at home is risky due to potential theft, fire, or loss. More importantly, it misses out on the opportunity to grow through interest in a bank account or returns from investments."
  },
  {
    question: "What is the main benefit of financial literacy for an individual?",
    options: [
      { text: "It guarantees immediate wealth accumulation.", isCorrect: false },
      { text: "It provides the basic skills to manage personal finances, make informed decisions, and build a secure financial future.", isCorrect: true },
      { text: "It eliminates the need for professional financial advice.", isCorrect: false },
      { text: "It only helps in understanding complex stock market strategies.", isCorrect: false },
    ],
    explanation: "Financial literacy equips individuals with the knowledge and skills to understand financial concepts, manage their money effectively, plan for the future, and make sound financial decisions that contribute to their well-being."
  },

  // --- Intermediate Level Questions ---
  {
    question: "What is the primary difference in cost between a 'Direct Plan' and a 'Regular Plan' of a mutual fund?",
    options: [
      { text: "Direct Plans have a higher expense ratio due to direct management.", isCorrect: false },
      { text: "Regular Plans have a lower expense ratio as they are directly from the fund house.", isCorrect: false },
      { text: "Direct Plans have a lower expense ratio because they exclude distributor commissions and fees.", isCorrect: true },
      { text: "The cost is identical for both plans as per SEBI regulations.", isCorrect: false },
    ],
    explanation: "Direct Plans in mutual funds do not involve an intermediary, thus saving on distributor commissions and resulting in a lower expense ratio compared to Regular Plans, which include these charges."
  },
  {
    question: "What is the primary objective of a 'Debt Fund' in a mutual fund scheme?",
    options: [
      { text: "To achieve aggressive capital appreciation through equity investments.", isCorrect: false },
      { text: "To provide regular and steady income by investing in fixed-income securities.", isCorrect: true },
      { text: "To invest in highly speculative assets for quick returns.", isCorrect: false },
      { text: "To offer a combination of equity and debt for balanced growth.", isCorrect: false },
    ],
    explanation: "Debt funds primarily invest in fixed-income instruments like bonds, government securities, and money market instruments. Their main goal is to generate regular income and offer relatively lower risk compared to equity funds."
  },
  {
    question: "Which price discovery mechanism in an IPO allows investors to bid for shares within a specified price range?",
    options: [
      { text: "Fixed price issue.", isCorrect: false },
      { text: "Book building issue.", isCorrect: true },
      { text: "Tender offer.", isCorrect: false },
      { text: "Rights issue.", isCorrect: false },
    ],
    explanation: "In a book-building issue, the issuer sets a price band (floor and cap price), and investors bid for shares within this range. The final issue price is determined based on the demand generated during the bidding period."
  },
  {
    question: "What is the main benefit of investing through a Systematic Investment Plan (SIP)?",
    options: [
      { text: "It guarantees a fixed return on investment regardless of market conditions.", isCorrect: false },
      { text: "It allows for large, one-time investments to maximize immediate gains.", isCorrect: false },
      { text: "It helps average out the cost of investment over time (rupee-cost averaging) and fosters investment discipline.", isCorrect: true },
      { text: "It eliminates all investment risks.", isCorrect: false },
    ],
    explanation: "SIPs involve investing a fixed amount at regular intervals. This strategy, known as rupee-cost averaging, helps mitigate the impact of market volatility and builds a disciplined saving habit, making it suitable for long-term wealth creation."
  },
  {
    question: "What is the primary role of a 'Depository Participant' (DP) in the Indian securities market?",
    options: [
      { text: "To provide financial advisory services to investors.", isCorrect: false },
      { text: "To execute buy and sell orders on behalf of investors on the stock exchange.", isCorrect: false },
      { text: "To open and maintain Demat accounts for clients, acting as an agent of the depository.", isCorrect: true },
      { text: "To regulate the stock exchanges.", isCorrect: false },
    ],
    explanation: "A Depository Participant (DP) serves as an intermediary between investors and the central depositories (NSDL/CDSL). DPs facilitate the opening of Demat accounts and manage the electronic holding of securities for investors."
  },
  {
    question: "What is a 'Contract Note' and why is it important for an investor?",
    options: [
      { text: "A document that guarantees profit on a trade.", isCorrect: false },
      { text: "A legal document issued by a broker confirming the details of a trade executed on behalf of a client.", isCorrect: true },
      { text: "A form to apply for new shares in an IPO.", isCorrect: false },
      { text: "A statement showing the investor's bank account balance.", isCorrect: false },
    ],
    explanation: "A Contract Note is a crucial legal document provided by a stockbroker to an investor within 24 hours of a trade. It details the securities traded, price, time, and all charges, allowing investors to verify their transactions."
  },
  {
    question: "What is the primary purpose of an 'Open Offer' of shares in a company?",
    options: [
      { text: "To allow the company to buy back its own shares from the open market.", isCorrect: false },
      { text: "To give existing shareholders a fair opportunity to exit the company if its ownership or management changes significantly.", isCorrect: true },
      { text: "To raise new capital for the company's expansion projects.", isCorrect: false },
      { text: "To allow employees to buy shares at a discounted price.", isCorrect: false },
    ],
    explanation: "An Open Offer is typically mandated when there's a substantial acquisition of shares or a change in company control. It provides a fair exit opportunity to existing shareholders who may not wish to continue with the new management."
  },
  {
    question: "What is 'Transposition' in the context of Demat accounts?",
    options: [
      { text: "The process of converting physical shares to electronic form.", isCorrect: false },
      { text: "The process of converting electronic shares back to physical form.", isCorrect: false },
      { text: "The process of rectifying the order of names of joint Demat account holders to match the order on physical share certificates.", isCorrect: true },
      { text: "The transfer of shares from one Demat account to another.", isCorrect: false },
    ],
    explanation: "Transposition is required when the order of names on joint share certificates or other records does not match the order of names in the Demat account. It's a process to align these records."
  },
  {
    question: "Why is it generally not advisable for a non-resident Indian (NRI) to engage in intraday trading in the Indian cash segment?",
    options: [
      { text: "Intraday trading is explicitly prohibited for NRIs in the Indian cash segment, who are only allowed delivery-based transactions.", isCorrect: true },
      { text: "The tax implications for intraday trading are too complex for NRIs.", isCorrect: false },
      { text: "NRIs can only trade in a limited number of specific stocks for intraday.", isCorrect: false },
      { text: "The brokerage charges for NRIs are excessively high for intraday trading.", isCorrect: false },
    ],
    explanation: "Indian regulations restrict NRIs to delivery-based transactions in the cash segment. Intraday trading and short selling are generally not permitted for NRIs to manage currency and settlement risks."
  },
  {
    question: "What is the main benefit for a retail investor to purchase units of a Real Estate Investment Trust (REIT)?",
    options: [
      { text: "Guaranteed high returns from real estate properties.", isCorrect: false },
      { text: "The ability to individually own and manage entire large commercial properties.", isCorrect: false },
      { text: "The opportunity to own a fractional share in a portfolio of income-generating real estate assets with liquidity and smaller investment size.", isCorrect: true },
      { text: "Access to investing in speculative land banking and agricultural land.", isCorrect: false },
    ],
    explanation: "REITs allow retail investors to gain exposure to a diversified portfolio of income-generating real estate without direct property ownership. They offer liquidity (as units are traded on exchanges) and a smaller investment ticket size."
  },
  {
    question: "What is the significance of the 'Risk-o-Meter' introduced by SEBI for mutual funds?",
    options: [
      { text: "It guarantees the minimum returns an investor will receive from a fund.", isCorrect: false },
      { text: "It labels mutual funds according to their level of risk, helping investors align fund risk with their own risk appetite.", isCorrect: true },
      { text: "It predicts the future performance of a mutual fund scheme.", isCorrect: false },
      { text: "It is a tool for fund managers to track their performance against benchmarks.", isCorrect: false },
    ],
    explanation: "The Risk-o-Meter is a visual tool that categorizes mutual fund schemes into six risk levels (Low to Very High). This helps investors quickly understand the inherent risk of a fund and make informed decisions suitable for their personal risk tolerance."
  },
  {
    question: "What does 'Contango' signify in the context of futures trading?",
    options: [
      { text: "The spot price is higher than the futures price.", isCorrect: false },
      { text: "The futures price is higher than the spot price.", isCorrect: true },
      { text: "The spot and futures prices are identical.", isCorrect: false },
      { text: "A market condition indicating a supply shortage.", isCorrect: false },
    ],
    explanation: "Contango is a market condition where the futures price of a commodity is higher than its current spot price. This typically reflects the 'cost of carry' (storage, insurance, financing) until the future delivery date."
  },
  {
    question: "What is the primary objective of a 'passive fund' like an Index Fund or an ETF?",
    options: [
      { text: "To actively outperform a specific market index.", isCorrect: false },
      { text: "To replicate the performance of a particular index by investing in the same securities in the same proportion.", isCorrect: true },
      { text: "To generate fixed, guaranteed returns for investors.", isCorrect: false },
      { text: "To engage in frequent buying and selling of securities to capitalize on short-term market movements.", isCorrect: false },
    ],
    explanation: "Passive funds aim to mirror the performance of a benchmark index. They achieve this by investing in the same securities and in the same proportions as the index, rather than attempting to beat the market through active stock selection."
  },
  {
    question: "What is a key responsibility of a shareholder when a company announces a corporate action like a buyback?",
    options: [
      { text: "To immediately sell all their shares regardless of the offer.", isCorrect: false },
      { text: "To read and understand the Letter of Offer (LoO) and other disclosures before deciding to participate.", isCorrect: true },
      { text: "To assume the offer price is always fair and beneficial.", isCorrect: false },
      { text: "To demand a higher price than what is offered by the company.", isCorrect: false },
    ],
    explanation: "Shareholders have a responsibility to conduct due diligence by carefully reading the Letter of Offer and other public announcements. This ensures they understand the terms, risks, and implications of the corporate action before making an informed decision."
  },
  {
    question: "What is the significance of the 'T+1' settlement cycle being introduced in the Indian stock market?",
    options: [
      { text: "It increases the time required for trade settlement to two working days.", isCorrect: false },
      { text: "It reduces the time for trade settlement to one working day, enhancing market efficiency and liquidity.", isCorrect: true },
      { text: "It mandates all trades to be settled in cash only.", isCorrect: false },
      { text: "It applies only to derivative contracts, not to equity trades.", isCorrect: false },
    ],
    explanation: "The 'T+1' (Trade plus one day) settlement cycle significantly shortens the time it takes for funds and securities to be transferred after a trade. This improves market efficiency, reduces counterparty risk, and enhances liquidity."
  },
  {
    question: "When is 'Transposition' of names required in a Demat account?",
    options: [
      { text: "When converting physical shares to electronic form.", isCorrect: false },
      { text: "When the order of names in a joint Demat account does not match the order on the physical share certificates or other records.", isCorrect: true },
      { text: "When transferring shares from one Demat account to another.", isCorrect: false },
      { text: "When a shareholder changes their name legally.", isCorrect: false },
    ],
    explanation: "Transposition is a process to align the order of names in a joint Demat account with the order of names on the physical share certificates or other relevant documents, which is necessary for dematerialization or other transactions."
  },
  {
    question: "What is the primary benefit for a retail investor investing in a Real Estate Investment Trust (REIT)?",
    options: [
      { text: "Direct ownership and management of large commercial properties.", isCorrect: false },
      { text: "Guaranteed rental income and property appreciation.", isCorrect: false },
      { text: "Opportunity to invest in a diversified portfolio of income-generating real estate with liquidity and smaller investment size.", isCorrect: true },
      { text: "Exemption from all taxes on real estate income.", isCorrect: false },
    ],
    explanation: "REITs offer retail investors a way to invest in real estate without the need for large capital or direct management. They provide diversification, professional management, and liquidity as REIT units are traded on stock exchanges."
  },
  {
    question: "What is the primary role of a 'Contract Note' in securities trading?",
    options: [
      { text: "To serve as a marketing document for new investment products.", isCorrect: false },
      { text: "To act as a legally binding confirmation and record of a trade executed by a stockbroker on behalf of a client.", isCorrect: true },
      { text: "To provide a summary of all available stocks for trading.", isCorrect: false },
      { text: "To guarantee a specific profit margin on every trade.", isCorrect: false },
    ],
    explanation: "A Contract Note is a critical legal document issued by a stockbroker within 24 hours of a trade. It provides detailed information about the transaction, including the security, price, quantity, and charges, enabling investors to verify their trades."
  },
  {
    question: "Why is it crucial for investors to use their own funds when applying for an IPO, and what is the consequence of using third-party funds?",
    options: [
      { text: "Using third-party funds is a legal requirement to show high demand for the IPO.", isCorrect: false },
      { text: "Using own funds ensures transparency and prevents illegal activities; third-party applications are not allowed and may be rejected.", isCorrect: true },
      { text: "It helps in securing a higher allotment of shares in an oversubscribed IPO.", isCorrect: false },
      { text: "There are no significant consequences, it's just a recommendation.", isCorrect: false },
    ],
    explanation: "SEBI mandates that investors use their own funds for IPO applications to ensure transparency and prevent money laundering. Applications funded by third parties are considered invalid and are subject to rejection."
  },
  {
    question: "What is the primary purpose of an 'Open Offer' of shares in a company?",
    options: [
      { text: "To allow the company to raise additional capital from new investors.", isCorrect: false },
      { text: "To provide existing shareholders a fair opportunity to exit the company if there is a change in ownership or management.", isCorrect: true },
      { text: "To facilitate the company's buyback of its own shares from the market.", isCorrect: false },
      { text: "To enable the company to delist its shares from the stock exchange.", isCorrect: false },
    ],
    explanation: "An Open Offer is triggered by a substantial acquisition of shares or a change in control of a company. It ensures that public shareholders have an equitable opportunity to sell their shares at a fair price if they do not wish to remain invested under the new management."
  },

  // --- Advanced Level Questions ---
  {
    question: "What are the key determinants of an option's price in the Black-Scholes model?",
    options: [
      { text: "Past stock performance and current news headlines.", isCorrect: false },
      { text: "Strike price, underlying asset price, volatility, time to expiration, and risk-free interest rate.", isCorrect: true },
      { text: "The option seller's reputation and the buyer's investment horizon.", isCorrect: false },
      { text: "Trading volume of the option and the overall market sentiment.", isCorrect: false },
    ],
    explanation: "The Black-Scholes model, a fundamental tool for options pricing, considers five main inputs: the strike price of the option, the current price of the underlying asset, the volatility of the underlying asset, the time remaining until expiration, and the risk-free interest rate."
  },
  {
    question: "An investor owns a commodity and is concerned about its price falling significantly. Which options strategy can be used as a protective measure against this risk while allowing for potential upside?",
    options: [
      { text: "Selling a call option on the commodity.", isCorrect: false },
      { text: "Buying a put option on the commodity they own.", isCorrect: true },
      { text: "Selling a put option on the commodity.", isCorrect: false },
      { text: "Buying a call option on the commodity.", isCorrect: false },
    ],
    explanation: "Buying a put option on an owned commodity (a 'protective put') provides a floor for the selling price of the commodity, thus hedging against a fall in price. If the commodity's price rises, the investor benefits from the upside, and the put option expires worthless."
  },
  {
    question: "What is the primary characteristic that defines an Alternative Investment Fund (AIF)?",
    options: [
      { text: "It is a publicly traded fund for all retail investors with high liquidity.", isCorrect: false },
      { text: "It is a privately pooled investment vehicle for sophisticated investors, investing in diverse, often illiquid assets.", isCorrect: true },
      { text: "It is a government-backed scheme offering guaranteed returns for specific social causes.", isCorrect: false },
      { text: "It is an investment vehicle focused solely on short-term gains in highly liquid money market instruments.", isCorrect: false },
    ],
    explanation: "An AIF is a privately pooled investment vehicle, established in India, which collects funds from sophisticated investors (high net worth individuals, institutions) for investing in accordance with a defined investment policy. AIFs typically invest in assets that are not easily accessible through traditional public markets, like venture capital, private equity, and structured debt."
  },
  {
    question: "In the context of REITs and InvITs, what is the tax treatment for dividends distributed to unitholders, and under what specific condition can they become taxable?",
    options: [
      { text: "Dividends are always taxable for all unitholders, regardless of the SPV's tax regime.", isCorrect: false },
      { text: "Dividends are always exempted from tax for all unitholders, without any conditions.", isCorrect: false },
      { text: "Dividends are generally exempted from tax for unitholders, but become taxable if the underlying SPV has opted for a lower tax regime.", isCorrect: true },
      { text: "Dividends are only taxable for foreign institutional investors, not for domestic unitholders.", isCorrect: false },
    ],
    explanation: "For REITs and InvITs, dividends distributed to unitholders are typically tax-exempt. However, this exemption is conditional and will not apply if the Special Purpose Vehicle (SPV) through which the REIT/InvIT holds assets has chosen to be taxed under a concessional or lower tax regime."
  },
  {
    question: "What is the specific price relationship between the spot price and the futures price that defines a state of 'backwardation'?",
    options: [
      { text: "The spot price is equal to the futures price.", isCorrect: false },
      { text: "The futures price is higher than the spot price.", isCorrect: false },
      { text: "The spot price is higher than the futures price.", isCorrect: true },
      { text: "The market is experiencing a premium due to high demand.", isCorrect: false },
    ],
    explanation: "Backwardation is a market phenomenon where the current spot price of an asset is higher than its futures price. This can occur due to immediate supply shortages, high current demand, or expectations of future oversupply."
  },
  {
    question: "In the context of options trading, what does 'Delta' specifically measure?",
    options: [
      { text: "The rate of decay of an option's value due to the passage of time.", isCorrect: false },
      { text: "The sensitivity of an option's price to changes in market volatility.", isCorrect: false },
      { text: "The rate of change of an option's premium with respect to a one-unit change in the underlying asset's futures price.", isCorrect: true },
      { text: "The sensitivity of an option's price to changes in interest rates.", isCorrect: false },
    ],
    explanation: "Delta is a key 'Greek' that quantifies an option's price sensitivity. It indicates how much an option's theoretical value is expected to change for every one-point movement in the price of the underlying asset."
  },
  {
    question: "Which of the following characteristics is crucial for a commodity to be suitable for efficient futures trading?",
    options: [
      { text: "It must be a rare and unique commodity.", isCorrect: false },
      { text: "It must be heterogeneous and easily distinguishable by quality.", isCorrect: false },
      { text: "It must be homogenous and capable of standardization, with a large and freely traded market.", isCorrect: true },
      { text: "Its price must be entirely controlled by government intervention.", isCorrect: false },
    ],
    explanation: "For a commodity to be efficiently traded on a futures exchange, it must be homogeneous (uniform in quality) and capable of standardization. This ensures that contracts are interchangeable and widely accepted, facilitating liquidity and fair price discovery."
  },
  {
    question: "According to SEBI regulations, what is the minimum percentage of the value of a public Real Estate Investment Trust (REIT) that must be invested in 'completed and income-producing assets'?",
    options: [
      { text: "20% of its total value.", isCorrect: false },
      { text: "50% of its total value.", isCorrect: false },
      { text: "80% of its total value.", isCorrect: true },
      { text: "100% of its total value.", isCorrect: false },
    ],
    explanation: "Public REITs are mandated by SEBI to invest at least 80% of their total value in completed and income-producing real estate assets. This ensures a stable income stream for unitholders and reduces the risk associated with under-construction projects."
  },
  {
    question: "What is 'Haircut' as it applies to margin payments when an investor pledges securities?",
    options: [
      { text: "A fixed fee charged by the stockbroker for processing the pledge.", isCorrect: false },
      { text: "The interest rate applied to the loan amount against the pledged securities.", isCorrect: false },
      { text: "The percentage reduction applied to the market value of pledged shares to determine their collateral value for margin purposes.", isCorrect: true },
      { text: "A penalty imposed for failing to maintain sufficient margin.", isCorrect: false },
    ],
    explanation: "A 'haircut' is a risk management measure. It's a percentage reduction applied to the market value of securities pledged as collateral for margin. This reduction accounts for potential price volatility, meaning the collateral value is less than the full market value."
  },
  {
    question: "What is the primary role of an 'Arbitrager' in the commodity derivatives market, and how do they contribute to market efficiency?",
    options: [
      { text: "They primarily speculate on future price movements to earn high returns.", isCorrect: false },
      { text: "They act as market makers, continuously providing bid and ask prices to ensure liquidity.", isCorrect: false },
      { text: "They capitalize on price differences of the same asset across different markets to earn a riskless profit, thereby inducing price convergence.", isCorrect: true },
      { text: "They manage the storage and physical delivery of commodities.", isCorrect: false },
    ],
    explanation: "Arbitragers identify and exploit temporary price discrepancies for the same commodity in different markets. By simultaneously buying in one market and selling in another, they earn a riskless profit and, in doing so, help to align prices across markets, contributing to overall market efficiency."
  },

  // --- Comprehensive Quiz Questions ---
  {
    question: "Which statement accurately describes the concept of 'Rupee Cost Averaging'?",
    options: [
      { text: "A strategy to invest a large, one-time sum of money in a single stock.", isCorrect: false },
      { text: "A strategy where you invest a fixed amount of money at regular intervals, which helps you buy more units when prices are low and fewer when prices are high.", isCorrect: true },
      { text: "A technique used by investors to predict the best time to invest in the market.", isCorrect: false },
      { text: "A process that guarantees your investment will never lose value.", isCorrect: false },
    ],
    explanation: "Rupee cost averaging is a strategy often used with Systematic Investment Plans (SIPs). It involves investing a fixed amount of money at regular intervals, regardless of market fluctuations. This practice averages out the cost of your investments over time and reduces the impact of short-term market volatility."
  },
  {
    question: "You are a non-resident Indian (NRI) with funds in an NRO bank account. What is a key limitation you face if you wish to repatriate these funds?",
    options: [
          { text: "There are no limitations; funds in an NRO account are fully and freely repatriable.", isCorrect: false },
          { text: "Repatriation is limited to a maximum of USD 1 million per financial year, subject to certain conditions.", isCorrect: true },
          { text: "You cannot repatriate any funds from an NRO account.", isCorrect: false },
          { text: "You can only repatriate the interest earned, not the principal amount.", isCorrect: false },
        ],
    explanation: "While funds in an NRE (Non-Resident External) account are fully and freely repatriable, deposits in an NRO (Non-Resident Ordinary) account are subject to a yearly repatriation limit of up to USD 1 million. Any interest earned, however, is fully repatriable."
  },
  {
    question: "An investor wants to participate in an 'Open Offer' of shares. Which of the following is an accurate statement regarding their participation?",
    options: [
          { text: "Once an investor tenders shares, they can withdraw their bid at any time.", isCorrect: false },
          { text: "Participation is mandatory for all shareholders of the target company.", isCorrect: false },
          { text: "The investor can tender shares only if the offer price is lower than the market price.", isCorrect: false },
          { text: "The investor cannot withdraw their tendered bids or shares after making the offer.", isCorrect: true },
        ],
    explanation: "Unlike some other corporate actions, an investor cannot withdraw their tendered bids or shares once they have participated in an open offer. This is a crucial detail for investors to remember before deciding to participate, as the decision is irrevocable."
  },
  {
    question: "What is the fundamental difference between an 'Option' contract and a 'Futures' contract?",
    options: [
          { text: "In a futures contract, both the buyer and seller have a binding obligation, while in an option contract, the buyer has the right but not the obligation.", isCorrect: true },
          { text: "Both contracts give the holder the right but not the obligation to trade an asset.", isCorrect: false },
          { text: "A futures contract is not legally binding, while an option contract is.", isCorrect: false },
          { text: "Options are always traded on an exchange, while futures are not.", isCorrect: false },
        ],
    explanation: "A futures contract is a legally binding agreement for both parties, meaning the buyer must buy and the seller must sell. An options contract, however, gives the buyer the right, but not the obligation, to exercise the contract."
  },
  {
    question: "As per SEBI's Investor Charter, what is a key responsibility of an investor?",
    options: [
          { text: "To share their internet trading account password with a trusted person for convenience.", isCorrect: false },
          { text: "To keep a large amount of idle funds in their stockbroker's trading account.", isCorrect: false },
          { text: "To read and understand the Power of Attorney (PoA) before executing it, remembering that it is not a mandatory document.", isCorrect: true },
          { text: "To blindly follow media reports about a company's financial performance.", isCorrect: false },
        ],
    explanation: "The Investor Charter and other documents emphasize several 'dos and don'ts' for investors. Key responsibilities include avoiding sharing passwords, not keeping idle funds with a broker, and understanding all legal documents, such as the PoA, which is an optional document."
  },
  {
    question: "An investor holds securities in electronic form in a Demat account. What is the correct term for the process of converting these electronic securities back into physical share certificates?",
    options: [
          { text: "Dematerialisation.", isCorrect: false },
          { text: "Rematerialisation.", isCorrect: true },
          { text: "Transposition.", isCorrect: false },
          { text: "Transmission.", isCorrect: false },
        ],
    explanation: "Rematerialisation is the reverse process of Dematerialization. It involves converting securities that are held in an electronic or dematerialized form back into physical share certificates."
  },
  {
    question: "What is a primary objective for a company to issue shares through an 'Open Market Buyback' mechanism?",
    options: [
          { text: "To repurchase shares at a fixed price from a select group of shareholders.", isCorrect: false },
          { text: "To allow all shareholders to participate, giving them the option to sell their shares in the secondary market.", isCorrect: true },
          { text: "To guarantee a minimum price for the shares.", isCorrect: false },
          { text: "To conduct the buyback over a short period of 10 working days.", isCorrect: false },
        ],
    explanation: "In an Open Market buyback, the company repurchases its own shares directly from the secondary market over a period of up to six months. This method is open to all shareholders, allowing them the flexibility to sell their shares at their convenience."
  },
  {
    question: "What is the primary purpose of the SEBI SCORES platform for investors?",
    options: [
          { text: "To provide investment advice and stock tips to retail investors.", isCorrect: false },
          { text: "To serve as an online platform for investors to lodge and track complaints related to the securities market.", isCorrect: true },
          { text: "To offer a secure trading platform for derivatives.", isCorrect: false },
          { text: "To act as a banking intermediary for all financial transactions.", isCorrect: false },
        ],
    explanation: "SCORES, which stands for SEBI Complaints Redress System, is a centralized web-based platform that allows aggrieved investors to file complaints against listed companies and SEBI-registered intermediaries. It provides a transparent system for monitoring the resolution of these complaints."
  },
  {
    question: "According to SEBI regulations, what is the maximum percentage of an open-ended scheme's seed capital that an Asset Management Company (AMC) is required to invest?",
    options: [
          { text: "1% of the amount raised, subject to a maximum of ₹50 lakh.", isCorrect: true },
          { text: "5% of the amount raised, with no maximum limit.", isCorrect: false },
          { text: "10% of the net worth of the AMC.", isCorrect: false },
          { text: "50% of the AMC's board members' combined investment.", isCorrect: false },
        ],
    explanation: "An AMC is required to invest a seed capital of 1% of the amount raised in all open-ended schemes. This investment is subject to a maximum of ₹50 lakh and ensures that the AMC has a stake in the fund's performance."
  },
  {
    question: "What is 'Transmission' in the context of Demat accounts?",
    options: [
          { text: "The voluntary transfer of securities from one Demat account to another.", isCorrect: false },
          { text: "The transfer of securities that occurs due to a change in the order of joint account holders' names.", isCorrect: false },
          { text: "The involuntary transfer of securities from a deceased account holder to their legal heirs, a nominee, or a surviving joint holder, brought about by the operation of law.", isCorrect: true },
          { text: "The pledging of securities to a broker for margin payments.", isCorrect: false },
        ],
    explanation: "Transmission is the process of transferring securities from a Demat account to a legal heir, nominee, or surviving joint holder after the death of the account holder. It is a transfer by 'operation of law,' and it is not a voluntary act by the account holder."
  },
  // --- Additional Beginner Level Questions ---
  {
    question: "What is 'Net Worth'?",
    options: [
      { text: "Your total monthly income.", isCorrect: false },
      { text: "The value of your assets minus your liabilities.", isCorrect: true },
      { text: "The amount of money you have in your savings account.", isCorrect: false },
      { text: "The total amount of debt you owe.", isCorrect: false },
    ],
    explanation: "Net worth is a measure of your financial health, calculated by subtracting what you owe (liabilities) from what you own (assets)."
  },
  {
    question: "Why is 'compounding' considered powerful in investing?",
    options: [
      { text: "It guarantees that your investment will never lose value.", isCorrect: false },
      { text: "It allows you to earn returns on your initial investment and on the accumulated interest.", isCorrect: true },
      { text: "It simplifies the process of choosing investments.", isCorrect: false },
      { text: "It reduces the amount of taxes you have to pay on your earnings.", isCorrect: false },
    ],
    explanation: "Compounding is powerful because your earnings themselves start earning returns, leading to exponential growth over time. The longer you invest, the greater the effect of compounding."
  },
  {
    question: "What is the primary purpose of a 'savings bank account'?",
    options: [
      { text: "To store large sums of cash for long-term investments.", isCorrect: false },
      { text: "To safely keep money for short-term needs and earn a small amount of interest.", isCorrect: true },
      { text: "To conduct business transactions with no interest earned.", isCorrect: false },
      { text: "To get immediate access to large loans.", isCorrect: false },
    ],
    explanation: "A savings bank account is designed for individuals to keep money for daily or short-term needs, offering safety, liquidity, and a modest interest rate."
  },
  {
    question: "What does 'KYC' stand for in banking?",
    options: [
      { text: "Keep Your Cash.", isCorrect: false },
      { text: "Know Your Client.", isCorrect: true },
      { text: "Key Yield Calculation.", isCorrect: false },
      { text: "Kindly Verify Charges.", isCorrect: false },
    ],
    explanation: "KYC (Know Your Customer) is a mandatory process for financial institutions to verify the identity and address of their clients, crucial for preventing fraud and illegal activities."
  },
  {
    question: "What is a 'Dividend' from a company?",
    options: [
      { text: "A loan provided to shareholders.", isCorrect: false },
      { text: "A portion of the company's profits distributed to its shareholders.", isCorrect: true },
      { text: "A fee charged for holding shares.", isCorrect: false },
      { text: "A type of tax on company earnings.", isCorrect: false },
    ],
    explanation: "A dividend is a payment made by a company to its shareholders, usually out of its profits. It represents a return on the shareholder's investment."
  },
  {
    question: "What is the primary function of the 'primary market'?",
    options: [
      { text: "Trading of already issued securities.", isCorrect: false },
      { text: "Issuing new securities to raise capital for the first time.", isCorrect: true },
      { text: "Resolving investor grievances.", isCorrect: false },
      { text: "Providing financial advice.", isCorrect: false },
    ],
    explanation: "The primary market is where companies and governments raise capital by issuing new securities (like stocks or bonds) directly to investors for the first time, often through IPOs."
  },
  {
    question: "What does a 'bull market' indicate?",
    options: [
      { text: "A period of declining prices and investor pessimism.", isCorrect: false },
      { text: "A market where prices are rising or expected to rise, with investor optimism.", isCorrect: true },
      { text: "A market with stable prices and low trading volume.", isCorrect: false },
      { text: "A market exclusive to large institutional investors.", isCorrect: false },
    ],
    explanation: "A bull market is characterized by rising stock prices and investor confidence, often reflecting strong economic conditions and positive expectations for corporate earnings."
  },
  {
    question: "What is the main purpose of a 'Demat account'?",
    options: [
      { text: "To store physical documents related to investments.", isCorrect: false },
      { text: "To hold securities like shares and bonds in electronic form.", isCorrect: true },
      { text: "To manage daily banking transactions.", isCorrect: false },
      { text: "To apply for loans.", isCorrect: false },
    ],
    explanation: "A Demat account (dematerialized account) allows investors to hold securities in an electronic format, making transactions faster, safer, and eliminating the risks associated with physical certificates."
  },
  {
    question: "Who regulates the Indian securities market?",
    options: [
      { text: "Reserve Bank of India (RBI).", isCorrect: false },
      { text: "Ministry of Finance.", isCorrect: false },
      { text: "Securities and Exchange Board of India (SEBI).", isCorrect: true },
      { text: "National Stock Exchange (NSE).", isCorrect: false },
    ],
    explanation: "SEBI (Securities and Exchange Board of India) is the statutory regulatory body established to protect investors, promote market development, and regulate the Indian securities market."
  },
  {
    question: "What is 'inflation'?",
    options: [
      { text: "A decrease in the cost of living.", isCorrect: false },
      { text: "The rate at which the general level of prices for goods and services is rising, and subsequently, purchasing power is falling.", isCorrect: true },
      { text: "A period of economic stability.", isCorrect: false },
      { text: "An increase in the value of a country's currency.", isCorrect: false },
    ],
    explanation: "Inflation refers to the sustained increase in the general price level of goods and services over a period, which means money buys less than it did before."
  },

  // --- Additional Intermediate Level Questions ---
  {
    question: "What is 'Rupee Cost Averaging' and what is its benefit?",
    options: [
      { text: "Investing a large lump sum at a single market point to maximize returns.", isCorrect: false },
      { text: "A strategy of investing a fixed amount regularly, which averages the purchase price and reduces volatility impact.", isCorrect: true },
      { text: "A method to predict market highs and lows for optimal entry and exit.", isCorrect: false },
      { text: "A technique to avoid all investment risks.", isCorrect: false },
    ],
    explanation: "Rupee Cost Averaging involves investing a consistent amount of money at regular intervals. This strategy helps reduce the average cost per unit over time, especially in volatile markets, by buying more units when prices are low and fewer when prices are high."
  },
  {
    question: "What is the primary function of a 'Depository Participant' (DP)?",
    options: [
      { text: "To provide loans against securities.", isCorrect: false },
      { text: "To act as an agent of the depository, opening and maintaining Demat accounts for investors.", isCorrect: true },
      { text: "To regulate the stock market.", isCorrect: false },
      { text: "To manage mutual fund portfolios.", isCorrect: false },
    ],
    explanation: "A Depository Participant (DP) is an intermediary between an investor and the Depository (NSDL or CDSL). DPs facilitate the dematerialization and rematerialization of securities and maintain investors' Demat accounts."
  },
  {
    question: "What does 'Contango' signify in futures trading?",
    options: [
      { text: "The spot price is higher than the futures price.", isCorrect: false },
      { text: "The futures price is higher than the spot price, reflecting the cost of carry.", isCorrect: true },
      { text: "The spot and futures prices are equal.", isCorrect: false },
      { text: "A market condition indicating high immediate demand.", isCorrect: false },
    ],
    explanation: "Contango is a market situation where the futures price of a commodity is higher than its current spot price. This difference typically covers the costs associated with holding the commodity until the future delivery date, such as storage and insurance."
  },
  {
    question: "What is a 'Contract Note' and why is it crucial for an investor?",
    options: [
      { text: "A marketing brochure for new investment products.", isCorrect: false },
      { text: "A legally binding document from a broker confirming trade details, essential for verification and grievance redressal.", isCorrect: true },
      { text: "A form to authorize a broker to trade on an investor's behalf.", isCorrect: false },
      { text: "A monthly statement of account balance.", isCorrect: false },
    ],
    explanation: "A Contract Note is a critical legal document issued by a stockbroker within 24 hours of a trade. It provides comprehensive details of the transaction, including price, quantity, and charges, allowing investors to verify and reconcile their trades."
  },
  {
    question: "What is the main purpose of an 'Open Offer' in corporate actions?",
    options: [
      { text: "To allow the company to buy back its own shares from the market.", isCorrect: false },
      { text: "To give existing shareholders an equitable opportunity to sell their shares if there's a change in company control or substantial acquisition.", isCorrect: true },
      { text: "To raise additional capital from new investors.", isCorrect: false },
      { text: "To facilitate the delisting of a company's shares from the stock exchange.", isCorrect: false },
    ],
    explanation: "An Open Offer is a mandatory or voluntary offer made by an acquirer to public shareholders. It ensures that shareholders have a fair chance to exit their investment if they do not wish to continue under new ownership or management."
  },
  {
    question: "What is 'Transposition' in the context of Demat accounts?",
    options: [
      { text: "The process of converting physical shares to electronic form.", isCorrect: false },
      { text: "The process of altering the order of names in a joint Demat account to match other records like physical certificates.", isCorrect: true },
      { text: "The transfer of securities between two different Demat accounts.", isCorrect: false },
      { text: "The pledging of securities for a loan.", isCorrect: false },
    ],
    explanation: "Transposition is a process to correct discrepancies in the order of names for joint holders between a Demat account and other official documents, ensuring consistency in records."
  },
  {
    question: "What does a 'passive fund' (e.g., Index Fund, ETF) aim to achieve?",
    options: [
      { text: "To actively outperform a benchmark index through expert stock picking.", isCorrect: false },
      { text: "To replicate the performance of a specific market index by holding its constituents in the same proportion.", isCorrect: true },
      { text: "To provide fixed, guaranteed returns regardless of market movements.", isCorrect: false },
      { text: "To engage in frequent trading to capitalize on short-term market fluctuations.", isCorrect: false },
    ],
    explanation: "Passive funds are designed to track a specific market index. Their strategy involves investing in the same securities and proportions as the index, aiming to match its performance rather than beat it, typically with lower costs."
  },
  {
    question: "What is the significance of the 'T+1' settlement cycle in the Indian stock market?",
    options: [
      { text: "It increases the time for trade settlement to two working days.", isCorrect: false },
      { text: "It reduces the time for trade settlement to one working day, enhancing market efficiency and liquidity.", isCorrect: true },
      { text: "It mandates all trades to be settled in cash only, without physical delivery.", isCorrect: false },
      { text: "It applies only to trades executed in the commodity derivatives segment.", isCorrect: false },
    ],
    explanation: "The 'T+1' (Trade plus one day) settlement cycle shortens the period between a trade and its final settlement. This improves market efficiency, reduces systemic risk, and increases liquidity by making funds and securities available faster."
  },
  {
    question: "What is the primary benefit for a retail investor purchasing units of a Real Estate Investment Trust (REIT)?",
    options: [
      { text: "Direct ownership and management of individual commercial properties.", isCorrect: false },
      { text: "Guaranteed high returns from real estate investments.", isCorrect: false },
      { text: "Opportunity to invest in a diversified portfolio of income-generating real estate with liquidity and smaller investment size.", isCorrect: true },
      { text: "Exemption from all taxes on real estate income.", isCorrect: false },
    ],
    explanation: "REITs enable retail investors to participate in the real estate market without the need for large capital or direct property management. They offer diversification, professional management, and liquidity as REIT units are traded on stock exchanges."
  },
  {
    question: "Why is it generally not advisable for a non-resident Indian (NRI) to engage in intraday trading in the Indian cash segment?",
    options: [
      { text: "Intraday trading is explicitly prohibited for NRIs in the Indian cash segment, who are generally allowed only delivery-based transactions.", isCorrect: true },
      { text: "The tax rates for intraday trading are significantly higher for NRIs.", isCorrect: false },
      { text: "NRIs have limited access to trading platforms that support intraday trading.", isCorrect: false },
      { text: "The foreign exchange conversion rates make intraday trading unprofitable for NRIs.", isCorrect: false },
    ],
    explanation: "Indian regulations primarily allow NRIs to engage in delivery-based transactions in the cash segment. Intraday trading and short selling are typically restricted for NRIs to manage currency risk and ensure proper settlement."
  },

  // --- Additional Advanced Level Questions ---
  {
    question: "In the Black-Scholes model for options pricing, what does 'Volatility' represent?",
    options: [
      { text: "The historical average price of the underlying asset.", isCorrect: false },
      { text: "The expected future direction of the underlying asset's price.", isCorrect: false },
      { text: "A measure of the expected fluctuations in the underlying asset's price over time.", isCorrect: true },
      { text: "The trading volume of the option contract.", isCorrect: false },
    ],
    explanation: "Volatility is a key input in the Black-Scholes model, representing the degree of variation of a trading price series over time. Higher volatility generally leads to higher option premiums, as there's a greater chance of the option moving in-the-money."
  },
  {
    question: "What is a 'protective put' options strategy?",
    options: [
      { text: "Selling a put option to generate income.", isCorrect: false },
      { text: "Buying a put option on an asset you already own to hedge against a price decline.", isCorrect: true },
      { text: "Selling a call option on an asset you do not own.", isCorrect: false },
      { text: "Simultaneously buying a call and a put option.", isCorrect: false },
    ],
    explanation: "A protective put involves buying a put option on a security that the investor already holds. This strategy acts like an insurance policy, limiting potential losses if the asset price falls below the put's strike price, while allowing participation in any upside."
  },
  {
    question: "What is the primary characteristic that defines an Alternative Investment Fund (AIF)?",
    options: [
      { text: "Publicly traded funds for all retail investors.", isCorrect: false },
      { text: "Privately pooled investment vehicles for sophisticated investors, often investing in diverse, illiquid assets.", isCorrect: true },
      { text: "Government-backed schemes offering guaranteed returns.", isCorrect: false },
      { text: "Funds investing solely in highly liquid money market instruments.", isCorrect: false },
    ],
    explanation: "AIFs are distinct as they are privately pooled investment vehicles, typically targeting high-net-worth individuals and institutions. They invest in a variety of assets that are not easily accessible through public markets, including venture capital, private equity, and structured debt."
  },
  {
    question: "In the context of REITs and InvITs, what is the tax treatment for dividends distributed to unitholders, and under what condition can they become taxable?",
    options: [
      { text: "Dividends are always taxable for all unitholders.", isCorrect: false },
      { text: "Dividends are always exempt from tax for all unitholders.", isCorrect: false },
      { text: "Dividends are generally exempt, but become taxable if the underlying Special Purpose Vehicle (SPV) has opted for a lower tax regime.", isCorrect: true },
      { text: "Dividends are only taxable for foreign investors, not for domestic unitholders.", isCorrect: false },
    ],
    explanation: "While dividends from REITs and InvITs are typically tax-exempt for unitholders, this exemption is conditional. If the underlying SPV has chosen to be taxed under a concessional or lower tax regime, then the dividends distributed by the trust become taxable in the hands of the unitholders."
  },
  {
    question: "What is 'backwardation' in futures trading?",
    options: [
      { text: "A market where the futures price is higher than the spot price.", isCorrect: false },
      { text: "A market where the spot price is higher than the futures price.", isCorrect: true },
      { text: "A condition where spot and futures prices are equal.", isCorrect: false },
      { text: "A term for a highly stable market.", isCorrect: false },
    ],
    explanation: "Backwardation is a market structure where the current spot price of a commodity is higher than its futures price. This can signal an immediate scarcity or high demand for the commodity, making it more expensive for prompt delivery."
  },
  {
    question: "In options trading, what does 'Delta' measure?",
    options: [
      { text: "The rate at which an option's value changes due to the passage of time.", isCorrect: false },
      { text: "The sensitivity of an option's price to changes in market volatility.", isCorrect: false },
      { text: "The rate of change of an option's premium with respect to a one-unit change in the underlying asset's futures price.", isCorrect: true },
      { text: "The impact of interest rate changes on an option's price.", isCorrect: false },
    ],
    explanation: "Delta is a key 'Greek' that represents the sensitivity of an option's price relative to a change in the underlying asset's price. A delta of 0.50 means the option's price is expected to move 50 cents for every $1 change in the underlying asset."
  },
  {
    question: "What characteristic is essential for a commodity to be suitable for efficient futures trading?",
    options: [
      { text: "It must be a unique and non-standardized product.", isCorrect: false },
      { text: "Its supply and demand must be controlled by a single entity.", isCorrect: false },
      { text: "It must be homogenous and capable of standardization, with a large and freely traded market.", isCorrect: true },
      { text: "It must be a financial instrument, not a physical good.", isCorrect: false },
    ],
    explanation: "For efficient futures trading, the underlying commodity must be fungible (interchangeable) and capable of being standardized in terms of quality, quantity, and delivery specifications. This allows for liquid and transparent trading of contracts."
  },
  {
    question: "According to SEBI regulations, what is the minimum percentage of a public Real Estate Investment Trust (REIT)'s value that must be invested in 'completed and revenue-generating infrastructure assets'?",
    options: [
      { text: "20% of its total value.", isCorrect: false },
      { text: "50% of its total value.", isCorrect: false },
      { text: "80% of its total value.", isCorrect: true },
      { text: "100% of its total value.", isCorrect: false },
    ],
    explanation: "SEBI mandates that public REITs must invest at least 80% of their total asset value in completed and income-producing real estate assets. This ensures a stable income stream and reduces the risk profile associated with speculative or undeveloped properties."
  },
  {
    question: "What is 'Haircut' in the context of margin payments when an investor pledges securities?",
    options: [
      { text: "A fixed brokerage commission for pledging securities.", isCorrect: false },
      { text: "The percentage by which the market value of pledged shares is reduced to determine their collateral value for margin.", isCorrect: true },
      { text: "The interest rate charged on the loan taken against pledged securities.", isCorrect: false },
      { text: "A penalty for failing to deliver pledged securities on time.", isCorrect: false },
    ],
    explanation: "A haircut is a risk control measure used by exchanges and clearing corporations. It's a percentage reduction applied to the market value of securities pledged as collateral to account for potential price fluctuations, thereby reducing the effective collateral value."
  },
  {
    question: "What is the primary role of an 'Arbitrager' in the commodity derivatives market, and how do they contribute to market efficiency?",
    options: [
      { text: "They primarily engage in long-term speculation on commodity prices.", isCorrect: false },
      { text: "They provide continuous bid and ask prices to ensure market liquidity.", isCorrect: false },
      { text: "They identify and exploit temporary price discrepancies across different markets to earn a riskless profit, which helps align prices and ensure market efficiency.", isCorrect: true },
      { text: "They manage the physical logistics and warehousing of commodities.", isCorrect: false },
    ],
    explanation: "Arbitragers capitalize on momentary price differences for the same commodity in different markets (e.g., spot vs. futures, or different exchanges). By simultaneously buying low and selling high, they ensure that prices across markets converge, contributing significantly to market efficiency and fair pricing."
  },

  // --- Additional Comprehensive Quiz Questions ---
  {
    question: "Which statement accurately describes the concept of 'Rupee Cost Averaging'?",
    options: [
      { text: "A strategy to invest a large, one-time sum of money in a single stock.", isCorrect: false },
      { text: "A strategy where you invest a fixed amount of money at regular intervals, which helps you buy more units when prices are low and fewer when prices are high.", isCorrect: true },
      { text: "A technique used by investors to predict the best time to invest in the market.", isCorrect: false },
      { text: "A process that guarantees your investment will never lose value.", isCorrect: false },
    ],
    explanation: "Rupee cost averaging is a strategy often used with Systematic Investment Plans (SIPs). It involves investing a fixed amount of money at regular intervals, regardless of market fluctuations. This practice averages out the cost of your investments over time and reduces the impact of short-term market volatility."
  },
  {
    question: "You are a non-resident Indian (NRI) with funds in an NRO bank account. What is a key limitation you face if you wish to repatriate these funds?",
    options: [
          { text: "There are no limitations; funds in an NRO account are fully and freely repatriable.", isCorrect: false },
          { text: "Repatriation is limited to a maximum of USD 1 million per financial year, subject to certain conditions.", isCorrect: true },
          { text: "You cannot repatriate any funds from an NRO account.", isCorrect: false },
          { text: "You can only repatriate the interest earned, not the principal amount.", isCorrect: false },
        ],
    explanation: "While funds in an NRE (Non-Resident External) account are fully and freely repatriable, deposits in an NRO (Non-Resident Ordinary) account are subject to a yearly repatriation limit of up to USD 1 million. Any interest earned, however, is fully repatriable."
  },
  {
    question: "An investor wants to participate in an 'Open Offer' of shares. Which of the following is an accurate statement regarding their participation?",
    options: [
          { text: "Once an investor tenders shares, they can withdraw their bid at any time.", isCorrect: false },
          { text: "Participation is mandatory for all shareholders of the target company.", isCorrect: false },
          { text: "The investor can tender shares only if the offer price is lower than the market price.", isCorrect: false },
          { text: "The investor cannot withdraw their tendered bids or shares after making the offer.", isCorrect: true },
        ],
    explanation: "Unlike some other corporate actions, an investor cannot withdraw their tendered bids or shares once they have participated in an open offer. This is a crucial detail for investors to remember before deciding to participate, as the decision is irrevocable."
  },
  {
    question: "What is the fundamental difference between an 'Option' contract and a 'Futures' contract?",
    options: [
          { text: "In a futures contract, both the buyer and seller have a binding obligation, while in an option contract, the buyer has the right but not the obligation.", isCorrect: true },
          { text: "Both contracts give the holder the right but not the obligation to trade an asset.", isCorrect: false },
          { text: "A futures contract is not legally binding, while an option contract is.", isCorrect: false },
          { text: "Options are always traded on an exchange, while futures are not.", isCorrect: false },
        ],
    explanation: "A futures contract is a legally binding agreement for both parties, meaning the buyer must buy and the seller must sell. An options contract, however, gives the buyer the right, but not the obligation, to exercise the contract."
  },
  {
    question: "As per SEBI's Investor Charter, what is a key responsibility of an investor?",
    options: [
          { text: "To share their internet trading account password with a trusted person for convenience.", isCorrect: false },
          { text: "To keep a large amount of idle funds in their stockbroker's trading account.", isCorrect: false },
          { text: "To read and understand the Power of Attorney (PoA) before executing it, remembering that it is not a mandatory document.", isCorrect: true },
          { text: "To blindly follow media reports about a company's financial performance.", isCorrect: false },
        ],
    explanation: "The Investor Charter and other documents emphasize several 'dos and don'ts' for investors. Key responsibilities include avoiding sharing passwords, not keeping idle funds with a broker, and understanding all legal documents, such as the PoA, which is an optional document."
  },
  {
    question: "An investor holds securities in electronic form in a Demat account. What is the correct term for the process of converting these electronic securities back into physical share certificates?",
    options: [
          { text: "Dematerialisation.", isCorrect: false },
          { text: "Rematerialisation.", isCorrect: true },
          { text: "Transposition.", isCorrect: false },
          { text: "Transmission.", isCorrect: false },
        ],
    explanation: "Rematerialisation is the reverse process of Dematerialization. It involves converting securities that are held in an electronic or dematerialized form back into physical share certificates."
  },
  {
    question: "What is a primary objective for a company to issue shares through an 'Open Market Buyback' mechanism?",
    options: [
          { text: "To repurchase shares at a fixed price from a select group of shareholders.", isCorrect: false },
          { text: "To allow all shareholders to participate, giving them the option to sell their shares in the secondary market.", isCorrect: true },
          { text: "To guarantee a minimum price for the shares.", isCorrect: false },
          { text: "To conduct the buyback over a short period of 10 working days.", isCorrect: false },
        ],
    explanation: "In an Open Market buyback, the company repurchases its own shares directly from the secondary market over a period of up to six months. This method is open to all shareholders, allowing them the flexibility to sell their shares at their convenience."
  },
  {
    question: "What is the primary purpose of the SEBI SCORES platform for investors?",
    options: [
          { text: "To provide investment advice and stock tips to retail investors.", isCorrect: false },
          { text: "To serve as an online platform for investors to lodge and track complaints related to the securities market.", isCorrect: true },
          { text: "To offer a secure trading platform for derivatives.", isCorrect: false },
          { text: "To act as a banking intermediary for all financial transactions.", isCorrect: false },
        ],
    explanation: "SCORES, which stands for SEBI Complaints Redress System, is a centralized web-based platform that allows aggrieved investors to file complaints against listed companies and SEBI-registered intermediaries. It provides a transparent system for monitoring the resolution of these complaints."
  },
  {
    question: "According to SEBI regulations, what is the maximum percentage of an open-ended scheme's seed capital that an Asset Management Company (AMC) is required to invest?",
    options: [
          { text: "1% of the amount raised, subject to a maximum of ₹50 lakh.", isCorrect: true },
          { text: "5% of the amount raised, with no maximum limit.", isCorrect: false },
          { text: "10% of the net worth of the AMC.", isCorrect: false },
          { text: "50% of the AMC's board members' combined investment.", isCorrect: false },
        ],
    explanation: "An AMC is required to invest a seed capital of 1% of the amount raised in all open-ended schemes. This investment is subject to a maximum of ₹50 lakh and ensures that the AMC has a stake in the fund's performance."
  },
  {
    question: "What is 'Transmission' in the context of Demat accounts?",
    options: [
          { text: "The voluntary transfer of securities from one Demat account to another.", isCorrect: false },
          { text: "The transfer of securities that occurs due to a change in the order of joint account holders' names.", isCorrect: false },
          { text: "The involuntary transfer of securities from a deceased account holder to their legal heirs, a nominee, or a surviving joint holder, brought about by the operation of law.", isCorrect: true },
          { text: "The pledging of securities to a broker for margin payments.", isCorrect: false },
        ],
    explanation: "Transmission is the process of transferring securities from a Demat account to a legal heir, nominee, or surviving joint holder after the death of the account holder. It is a transfer by 'operation of law,' and it is not a voluntary act by the account holder."
  },
  {
    question: "What is the 'Rule of 72' used to estimate?",
    options: [
      { text: "The ideal age to start investing.", isCorrect: false },
      { text: "The time it takes for an investment to double in value.", isCorrect: true },
      { text: "The amount of tax payable on investments.", isCorrect: false },
      { text: "The total value of a company's assets.", isCorrect: false },
    ],
    explanation: "The Rule of 72 is a quick calculation to estimate the number of years required to double an investment, by dividing 72 by the annual rate of return."
  },
  {
    question: "What does a 'surplus' in a budget mean?",
    options: [
      { text: "Expenses are greater than income.", isCorrect: false },
      { text: "Income is equal to expenses.", isCorrect: false },
      { text: "Income is greater than expenses.", isCorrect: true },
      { text: "You have borrowed money.", isCorrect: false },
    ],
    explanation: "A budget surplus occurs when your income exceeds your expenses, leaving you with extra money that can be saved or invested."
  },
  {
    question: "Which of the following is a 'soft commodity'?",
    options: [
      { text: "Gold.", isCorrect: false },
      { text: "Crude Oil.", isCorrect: false },
      { text: "Wheat.", isCorrect: true },
      { text: "Copper.", isCorrect: false },
    ],
    explanation: "Soft commodities are typically agricultural products or livestock that are grown or cultivated, such as wheat, coffee, sugar, or live cattle."
  },
  {
    question: "What is the main benefit of keeping money in a bank rather than at home?",
    options: [
      { text: "It allows you to spend money faster.", isCorrect: false },
      { text: "It provides safety from theft/loss and opportunity to earn interest.", isCorrect: true },
      { text: "It makes you ineligible for loans.", isCorrect: false },
      { text: "It reduces the value of your money.", isCorrect: false },
    ],
    explanation: "Banks offer security for your money, protecting it from theft or loss, and also allow your money to grow by earning interest, unlike cash kept at home."
  },
  {
    question: "What does 'EMI' stand for in the context of loans?",
    options: [
      { text: "Early Money Investment.", isCorrect: false },
      { text: "Equated Monthly Installment.", isCorrect: true },
      { text: "Extra Monthly Income.", isCorrect: false },
      { text: "Essential Market Indicator.", isCorrect: false },
    ],
    explanation: "EMI (Equated Monthly Installment) is a fixed payment made by a borrower to a lender at a specified date each month, covering both the principal and interest of a loan."
  },
  {
    question: "Who is primarily responsible for regulating the commodity derivatives market in India?",
    options: [
      { text: "Reserve Bank of India (RBI).", isCorrect: false },
      { text: "Insurance Regulatory and Development Authority of India (IRDAI).", isCorrect: false },
      { text: "Pension Fund Regulatory and Development Authority (PFRDA).", isCorrect: false },
      { text: "Securities and Exchange Board of India (SEBI).", isCorrect: true },
    ],
    explanation: "SEBI (Securities and Exchange Board of India) is the regulator for the commodity derivatives market in India, ensuring fair practices and investor protection."
  },
  {
    question: "What is the primary purpose of a 'Fixed Deposit (FD) Account'?",
    options: [
      { text: "To provide high liquidity for daily transactions.", isCorrect: false },
      { text: "To place funds with a bank for a fixed term at a certain interest rate.", isCorrect: true },
      { text: "To invest directly in the stock market.", isCorrect: false },
      { text: "To get a credit card.", isCorrect: false },
    ],
    explanation: "A Fixed Deposit (FD) allows you to lock in your money with a bank for a predetermined period, earning a fixed rate of interest, usually higher than a savings account."
  },
  {
    question: "What is 'Capital Appreciation' in investments?",
    options: [
      { text: "Receiving regular interest payments.", isCorrect: false },
      { text: "The increase in the market value of an investment over a period of time.", isCorrect: true },
      { text: "A fixed income from government bonds.", isCorrect: false },
      { text: "The total amount of dividends received.", isCorrect: false },
    ],
    explanation: "Capital appreciation refers to the increase in the value of an asset, such as shares or property, from its purchase price to its current market price. Investors benefit if they sell at the higher value."
  },
  {
    question: "Which of the following is a 'hard commodity'?",
    options: [
      { text: "Coffee.", isCorrect: false },
      { text: "Cotton.", isCorrect: false },
      { text: "Gold.", isCorrect: true },
      { text: "Sugar.", isCorrect: false },
    ],
    explanation: "Hard commodities are natural resources that must be mined or extracted, such as gold, silver, crude oil, and copper."
  },
  {
    question: "What is the primary objective of a 'mutual fund'?",
    options: [
      { text: "To guarantee returns to all investors.", isCorrect: false },
      { text: "To pool money from investors and invest in a diversified portfolio of securities.", isCorrect: true },
      { text: "To provide direct loans to individuals.", isCorrect: false },
      { text: "To regulate the stock market.", isCorrect: false },
    ],
    explanation: "A mutual fund collects money from multiple investors and invests it across various securities (stocks, bonds, etc.) according to a stated objective, offering diversification and professional management."
  },

// --- Additional Intermediate Level Questions (Set 2) ---
  {
    question: "What is the primary function of the 'ASBA' (Application Supported by Blocked Amount) facility in public issues?",
    options: [
      { text: "To guarantee allotment of shares to all applicants.", isCorrect: false },
      { text: "To block the application money in the investor's bank account, earning interest until allotment, and debiting only upon successful allotment.", isCorrect: true },
      { text: "To allow investors to pay for shares in cash.", isCorrect: false },
      { text: "To provide a loan to investors for applying in IPOs.", isCorrect: false },
    ],
    explanation: "ASBA allows an investor to apply for shares in public issues by blocking the application amount in their bank account. The money remains in the account and earns interest until the shares are allotted, and is debited only if the allotment is successful."
  },
  {
    question: "What is 'Backwardation' in futures trading?",
    options: [
      { text: "A market where the futures price is higher than the spot price.", isCorrect: false },
      { text: "A market where the spot price is higher than the futures price.", isCorrect: true },
      { text: "A condition where spot and futures prices are equal.", isCorrect: false },
      { text: "A term for a highly volatile market.", isCorrect: false },
    ],
    explanation: "Backwardation is a market condition where the current spot price of a commodity is higher than its futures price. This can occur due to immediate supply shortages or high current demand."
  },
  {
    question: "What is the main advantage of a 'Direct Plan' in a mutual fund over a 'Regular Plan'?",
    options: [
      { text: "Direct Plans offer personalized financial advice.", isCorrect: false },
      { text: "Direct Plans have a lower expense ratio due to the absence of distributor commissions, leading to potentially higher returns.", isCorrect: true },
      { text: "Direct Plans guarantee higher returns than Regular Plans.", isCorrect: false },
      { text: "Regular Plans are only for institutional investors.", isCorrect: false },
    ],
    explanation: "Direct Plans are purchased directly from the Asset Management Company (AMC) without an intermediary, thus eliminating distributor commissions. This results in a lower expense ratio and, consequently, potentially higher net returns for the investor."
  },
  {
    question: "What is the purpose of 'Marking to Market' in futures contracts?",
    options: [
      { text: "To physically deliver the underlying commodity daily.", isCorrect: false },
      { text: "To calculate and settle daily profits and losses to ensure financial integrity and reduce default risk.", isCorrect: true },
      { text: "To manipulate the price of the commodity.", isCorrect: false },
      { text: "To determine the final settlement price at contract expiry.", isCorrect: false },
    ],
    explanation: "Marking to Market is a daily process where the value of a futures contract is adjusted to its current market price. Profits are credited and losses are debited daily, which helps manage counterparty risk and ensures market integrity."
  },
  {
    question: "What is the significance of the 'Record Date' in a Rights Issue?",
    options: [
      { text: "It is the date when the new shares are listed on the exchange.", isCorrect: false },
      { text: "It is the date for determining shareholders eligible to participate in the Rights Issue.", isCorrect: true },
      { text: "It is the date when the application money is debited from the bank account.", isCorrect: false },
      { text: "It is the date by which all applications must be submitted.", isCorrect: false },
    ],
    explanation: "The Record Date is a specific date set by the company to identify which existing shareholders are eligible to receive the offer of new shares in a Rights Issue. Only shareholders on record as of this date are entitled to participate."
  },
  {
    question: "What is the primary objective of a 'Hybrid Fund' in a mutual fund scheme?",
    options: [
      { text: "To invest exclusively in high-risk equity instruments.", isCorrect: false },
      { text: "To invest solely in fixed-income securities for stable returns.", isCorrect: false },
      { text: "To provide both growth and regular income by investing in a mix of equity and debt securities.", isCorrect: true },
      { text: "To invest in alternative assets like real estate and gold.", isCorrect: false },
    ],
    explanation: "Hybrid funds (also known as balanced funds) aim to achieve a balance between capital appreciation and regular income. They do this by investing in a diversified mix of both equity and debt instruments, catering to investors with moderate risk appetites."
  },
  {
    question: "What is the 'Risk-o-Meter' for mutual funds primarily designed to convey?",
    options: [
      { text: "The guaranteed return potential of a scheme.", isCorrect: false },
      { text: "The historical performance of the fund manager.", isCorrect: false },
      { text: "The level of risk involved in a mutual fund scheme, from low to very high.", isCorrect: true },
      { text: "The liquidity of the fund's underlying assets.", isCorrect: false },
    ],
    explanation: "The Risk-o-Meter is a visual tool mandated by SEBI that categorizes mutual fund schemes based on their inherent risk levels. It helps investors quickly understand the risk profile of a fund and make informed decisions aligned with their own risk tolerance."
  },
  {
    question: "What is the purpose of 'Due Diligence' before making an investment?",
    options: [
      { text: "To make impulsive investment decisions.", isCorrect: false },
      { text: "To thoroughly research and analyze a company's financial health, business model, and future prospects to make an informed decision.", isCorrect: true },
      { text: "To rely solely on market rumors and tips.", isCorrect: false },
      { text: "To guarantee high returns on investment.", isCorrect: false },
    ],
    explanation: "Due diligence is the process of conducting comprehensive research and investigation on an investment opportunity. It involves analyzing a company's financials, management, industry, and risks to ensure a well-informed and prudent investment decision."
  },
  {
    question: "What is the primary function of a 'Contract Note' in securities trading?",
    options: [
      { text: "To serve as a marketing document for new IPOs.", isCorrect: false },
      { text: "To act as a legally binding confirmation of a trade executed by a stockbroker on behalf of a client.", isCorrect: true },
      { text: "To authorize a broker to manage an investor's portfolio.", isCorrect: false },
      { text: "To provide a summary of market news and analysis.", isCorrect: false },
    ],
    explanation: "A Contract Note is a crucial legal document issued by a stockbroker to an investor within 24 hours of a trade. It details all aspects of the transaction, including the security, price, quantity, and charges, serving as proof of the trade."
  },
  {
    question: "What is the main benefit of 'Rupee Cost Averaging' in volatile markets?",
    options: [
      { text: "It allows investors to always buy at the lowest price.", isCorrect: false },
      { text: "It helps reduce the average cost of investment per unit over time by buying more units when prices are low and fewer when high.", isCorrect: true },
      { text: "It guarantees higher returns in the short term.", isCorrect: false },
      { text: "It eliminates the need for market research.", isCorrect: false },
    ],
    explanation: "Rupee Cost Averaging is a strategy where you invest a fixed amount at regular intervals. In volatile markets, this means you buy more units when prices are down and fewer when prices are up, thereby averaging out your purchase cost and potentially reducing overall risk."
  },

// --- Additional Advanced Level Questions (Set 2) ---
  {
    question: "In options trading, what does 'Gamma' measure?",
    options: [
      { text: "The rate of decay of an option's value due to time passage.", isCorrect: false },
      { text: "The sensitivity of an option's price to changes in market volatility.", isCorrect: false },
      { text: "The rate of change of an option's Delta with respect to a change in the underlying asset's price.", isCorrect: true },
      { text: "The sensitivity of an option's price to changes in interest rates.", isCorrect: false },
    ],
    explanation: "Gamma is a 'second-order' Greek. It measures how much an option's Delta is expected to change for every one-point movement in the underlying asset's price. High Gamma indicates that Delta will change rapidly."
  },
  {
    question: "What is the primary objective of a 'Tender Offer' buyback method?",
    options: [
      { text: "To repurchase shares from the open market over an extended period.", isCorrect: false },
      { text: "To allow shareholders to tender their shares on a proportionate basis at a fixed price, typically higher than the market price.", isCorrect: true },
      { text: "To distribute bonus shares to existing shareholders.", isCorrect: false },
      { text: "To allow the company to issue new shares to a select group of investors.", isCorrect: false },
    ],
    explanation: "A Tender Offer is a method where a company offers to buy back a specific number of its shares from existing shareholders at a fixed price, usually at a premium to the market price. Shareholders can tender their shares in proportion to their holdings."
  },
  {
    question: "What is the significance of the 'DDPI' (Demat Debit and Pledge Instruction) facility in the securities market?",
    options: [
      { text: "It is a mandatory document that gives a broker unlimited power over a client's Demat account.", isCorrect: false },
      { text: "It is an optional document that limits the broker's authority to specific, secure transactions, mitigating misuse of PoA.", isCorrect: true },
      { text: "It is used solely for transferring funds between bank accounts.", isCorrect: false },
      { text: "It enables investors to trade in foreign currencies.", isCorrect: false },
    ],
    explanation: "The DDPI (Demat Debit and Pledge Instruction) is a voluntary alternative to a Power of Attorney (PoA). It allows investors to authorize specific transactions (like transferring securities for settlement or pledging) while retaining more control and mitigating the risk of misuse associated with a general PoA."
  },
  {
    question: "What is 'Haircut' in the context of margin payments for pledged securities?",
    options: [
      { text: "A fixed fee charged by the broker for a pledge transaction.", isCorrect: false },
      { text: "The percentage reduction applied to the market value of pledged shares to determine their collateral value for margin.", isCorrect: true },
      { text: "The interest rate charged on the loan against pledged securities.", isCorrect: false },
      { text: "A penalty for late delivery of securities.", isCorrect: false },
    ],
    explanation: "Haircut is a risk management measure. It's a percentage reduction applied to the market value of securities pledged as collateral for margin. This reduction accounts for potential price volatility, meaning the collateral value is less than the full market value."
  },
  {
    question: "What is the primary role of an 'Arbitrager' in the commodity derivatives market?",
    options: [
      { text: "To speculate on future price movements to earn high returns.", isCorrect: false },
      { text: "To identify and exploit temporary price discrepancies across different markets to earn a riskless profit, thereby inducing price convergence.", isCorrect: true },
      { text: "To provide continuous bid and ask prices to ensure market liquidity.", isCorrect: false },
      { text: "To manage the physical storage and transportation of commodities.", isCorrect: false },
    ],
    explanation: "Arbitragers are market participants who seek to profit from temporary price differences for the same commodity in different markets. By simultaneously buying low and selling high, they help ensure that prices across markets remain aligned, contributing to market efficiency."
  },
  {
    question: "What is 'Marking to Market' in futures contracts?",
    options: [
      { text: "The process of physically delivering the underlying commodity daily.", isCorrect: false },
      { text: "The daily settlement of profits and losses on futures contracts to ensure financial integrity and reduce default risk.", isCorrect: true },
      { text: "A strategy to artificially inflate the price of a commodity.", isCorrect: false },
      { text: "The final calculation of profit or loss at the contract's expiration.", isCorrect: false },
    ],
    explanation: "Marking to Market is a daily process where the value of a futures contract is adjusted to its current market price. Profits are credited to the investor's account, and losses are debited, ensuring that positions are settled daily and mitigating counterparty risk."
  },
  {
    question: "What is the key difference in 'repatriability' between an NRE (Non-Resident External) and an NRO (Non-Resident Ordinary) bank account?",
    options: [
      { text: "Funds in both NRE and NRO accounts are fully and freely repatriable.", isCorrect: false },
      { text: "Funds in an NRO account are fully repatriable, but NRE accounts are not.", isCorrect: false },
      { text: "NRE accounts offer full and free repatriability of both principal and interest, while NRO accounts have a limit of USD 1 million per year for principal repatriation.", isCorrect: true },
      { text: "Funds in both accounts are non-repatriable under all circumstances.", isCorrect: false },
    ],
    explanation: "NRE accounts are designed for foreign earnings and allow full repatriation of funds and interest. NRO accounts are for Indian earnings, and while interest is fully repatriable, the principal amount has an annual repatriation limit of USD 1 million."
  },
  {
    question: "Who is primarily responsible for monitoring market abuses like circular trading and price rigging in the Indian securities market?",
    options: [
      { text: "Individual investors.", isCorrect: false },
      { text: "Stockbrokers' associations.", isCorrect: false },
      { text: "The respective stock exchanges, under SEBI's oversight.", isCorrect: true },
      { text: "The Ministry of Finance.", isCorrect: false },
    ],
    explanation: "Stock exchanges have a primary responsibility, under the regulatory framework of SEBI, to monitor trading activities and prevent market abuses such as circular trading, price rigging, and price manipulation to ensure fair and transparent markets."
  },
  {
    question: "What is a key limitation of investing in an Alternative Investment Fund (AIF)?",
    options: [
      { text: "AIFs are publicly traded and highly liquid investment instruments.", isCorrect: false },
      { text: "AIFs offer guaranteed fixed returns over a short investment horizon.", isCorrect: false },
      { text: "AIFs are privately pooled and generally illiquid investment vehicles, with no secondary market for trading their units.", isCorrect: true },
      { text: "AIFs are regulated by the Reserve Bank of India (RBI) and are therefore very low risk.", isCorrect: false },
    ],
    explanation: "AIFs are designed for sophisticated investors and typically invest in illiquid assets. Consequently, their units are not publicly traded, making them illiquid and difficult to exit quickly, which is a significant limitation."
  },
  {
    question: "What is the primary difference between the old Online Dispute Resolution (ODR) mechanism and the new SMART ODR portal?",
    options: [
      { text: "The old mechanism was a single-step process, while the new one is multi-layered.", isCorrect: false },
      { text: "The old mechanism was largely offline and segmented, while SMART ODR is an end-to-end online, common portal for dispute resolution across MIIs.", isCorrect: true },
      { text: "The old mechanism was free for all investors, while SMART ODR charges fees from the initial stage.", isCorrect: false },
      { text: "SMART ODR is only for institutional investors, unlike the old ODR.", isCorrect: false },
    ],
    explanation: "The new SMART ODR portal represents a significant upgrade, offering an end-to-end online platform for dispute resolution. The old mechanism was often manual, fragmented, and lacked the centralized, online efficiency of SMART ODR."
  },
  {
    question: "What is the primary characteristic of a 'Debit Card'?",
    options: [
      { text: "It offers a credit facility for a certain period.", isCorrect: false },
      { text: "It is linked to your bank account and allows you to spend your own money.", isCorrect: true },
      { text: "It allows you to withdraw money even if your bank account is empty.", isCorrect: false },
      { text: "It is primarily used for international transactions only.", isCorrect: false },
    ],
    explanation: "A debit card is directly linked to your savings or current bank account, allowing you to make payments or withdraw cash using the funds available in your account."
  },
  {
    question: "What is 'Financial Literacy'?",
    options: [
      { text: "The ability to earn a large amount of money quickly.", isCorrect: false },
      { text: "The knowledge and skills to manage personal finances effectively and make informed financial decisions.", isCorrect: true },
      { text: "The process of investing all your money in a single asset.", isCorrect: false },
      { text: "The study of complex economic theories.", isCorrect: false },
    ],
    explanation: "Financial literacy is a life skill that empowers individuals to understand financial concepts, manage their income, expenses, assets, and liabilities, and plan for a secure financial future."
  },
  {
    question: "Which of the following is a 'soft commodity'?",
    options: [
      { text: "Aluminium.", isCorrect: false },
      { text: "Crude Palm Oil (CPO).", isCorrect: true },
      { text: "Nickel.", isCorrect: false },
      { text: "Diamond.", isCorrect: false },
    ],
    explanation: "Soft commodities are typically agricultural products that are grown or cultivated. Crude Palm Oil is an agricultural product, unlike metals or minerals."
  },
  {
    question: "What is the primary role of a 'savings bank account'?",
    options: [
      { text: "To facilitate large business transactions.", isCorrect: false },
      { text: "To store money safely for short-term needs and earn a small interest.", isCorrect: true },
      { text: "To provide high-risk investment opportunities.", isCorrect: false },
      { text: "To manage foreign currency exchanges.", isCorrect: false },
    ],
    explanation: "A savings bank account is designed for individuals to keep their money secure for daily or short-term financial needs, offering liquidity and a modest interest rate."
  },
  {
    question: "What does 'net worth' represent?",
    options: [
      { text: "Your total income before taxes.", isCorrect: false },
      { text: "The value of your assets minus your liabilities.", isCorrect: true },
      { text: "The amount of money you owe to others.", isCorrect: false },
      { text: "Your monthly expenditure.", isCorrect: false },
    ],
    explanation: "Net worth is a key indicator of financial health, calculated by subtracting your total liabilities (what you owe) from your total assets (what you own)."
  },
  {
    question: "What is the main benefit of 'compounding' in long-term investments?",
    options: [
      { text: "It guarantees a fixed return rate.", isCorrect: false },
      { text: "It ensures your money is always liquid.", isCorrect: false },
      { text: "It allows your earnings to generate further earnings, leading to exponential growth.", isCorrect: true },
      { text: "It simplifies tax calculations.", isCorrect: false },
    ],
    explanation: "Compounding is the process where the interest earned on an investment is reinvested, so that future interest is earned on both the original principal and the accumulated interest, leading to accelerated growth."
  },
  {
    question: "What is the primary risk associated with 'inflation' for investors?",
    options: [
      { text: "The risk of losing all invested capital.", isCorrect: false },
      { text: "The risk that your investment returns will not keep pace with rising prices, reducing your purchasing power.", isCorrect: true },
      { text: "The risk of sudden market crashes.", isCorrect: false },
      { text: "The risk of high brokerage fees.", isCorrect: false },
    ],
    explanation: "Inflation risk, also known as purchasing power risk, is the danger that the value of your investment's returns will be eroded by rising prices, meaning your money buys less in the future."
  },
  {
    question: "Which of the following is a 'hard commodity'?",
    options: [
      { text: "Rice.", isCorrect: false },
      { text: "Soybean.", isCorrect: false },
      { text: "Silver.", isCorrect: true },
      { text: "Turmeric.", isCorrect: false },
    ],
    explanation: "Hard commodities are natural resources that are typically mined or extracted from the earth, such as metals (gold, silver, copper) and energy products (crude oil, natural gas)."
  },
  {
    question: "What is the primary purpose of a 'budget'?",
    options: [
      { text: "To spend all available income immediately.", isCorrect: false },
      { text: "To track income and expenses, plan for future spending and saving, and avoid overspending.", isCorrect: true },
      { text: "To invest in high-risk assets for quick returns.", isCorrect: false },
      { text: "To borrow money from friends and family.", isCorrect: false },
    ],
    explanation: "A budget is a financial plan that helps individuals manage their money by allocating income to various expenses, savings, and investments, ensuring financial goals are met."
  },
  {
    question: "What does a 'bull market' typically indicate?",
    options: [
      { text: "A period of economic contraction.", isCorrect: false },
      { text: "A market where prices are generally falling, and investor sentiment is negative.", isCorrect: false },
      { text: "A market where prices are generally rising, and investor confidence is high.", isCorrect: true },
      { text: "A market with stable prices and low trading activity.", isCorrect: false },
    ],
    explanation: "A bull market is characterized by optimism, investor confidence, and rising stock prices, often fueled by strong economic growth and positive corporate earnings expectations."
  },

// --- Additional Intermediate Level Questions (Set 3) ---
  {
    question: "What is the main advantage of a 'Direct Plan' in a mutual fund scheme?",
    options: [
      { text: "It offers personalized financial advice from a distributor.", isCorrect: false },
      { text: "It has a lower expense ratio due to the absence of distributor commissions, potentially leading to higher returns.", isCorrect: true },
      { text: "It guarantees higher returns than a 'Regular Plan'.", isCorrect: false },
      { text: "It allows for cash transactions without KYC.", isCorrect: false },
    ],
    explanation: "Direct Plans cut out the intermediary, meaning no commissions are paid to distributors. This directly translates to a lower expense ratio for the investor, which can result in better returns over time."
  },
  {
    question: "What is 'Marking to Market' in futures contracts?",
    options: [
      { text: "The physical delivery of the underlying commodity at contract expiry.", isCorrect: false },
      { text: "The daily adjustment of profits and losses on futures contracts to reflect current market prices, ensuring financial integrity.", isCorrect: true },
      { text: "A strategy to fix the price of a commodity for future delivery.", isCorrect: false },
      { text: "The process of identifying suitable commodities for futures trading.", isCorrect: false },
    ],
    explanation: "Marking to Market is a critical risk management process in futures trading. Daily, the profits and losses on open positions are calculated based on the closing price and settled, preventing large accumulated debts and ensuring counterparty solvency."
  },
  {
    question: "What is the primary role of a 'Contract Note' in securities trading?",
    options: [
      { text: "To provide a summary of market news and analysis.", isCorrect: false },
      { text: "To serve as a legally binding confirmation of a trade executed by a stockbroker on behalf of a client.", isCorrect: true },
      { text: "To authorize a broker to manage an investor's portfolio.", isCorrect: false },
      { text: "To apply for new shares in an Initial Public Offering (IPO).", isCorrect: false },
    ],
    explanation: "A Contract Note is a vital legal document issued by a stockbroker to an investor within 24 hours of a trade. It details all aspects of the transaction, acting as proof of the trade and enabling verification."
  },
  {
    question: "What is 'Transposition' in the context of Demat accounts?",
    options: [
      { text: "The conversion of physical shares into electronic form.", isCorrect: false },
      { text: "The process of changing the order of names in a joint Demat account to match other official records.", isCorrect: true },
      { text: "The transfer of securities from one Demat account to another.", isCorrect: false },
      { text: "The pledging of securities as collateral for a loan.", isCorrect: false },
    ],
    explanation: "Transposition is required when there's a mismatch in the order of names for joint holders between a Demat account and other documents (like physical share certificates). It's a process to align these records."
  },
  {
    question: "What does 'Contango' in futures trading indicate?",
    options: [
      { text: "The spot price is higher than the futures price.", isCorrect: false },
      { text: "The futures price is higher than the spot price, typically reflecting the cost of carry.", isCorrect: true },
      { text: "The spot and futures prices are equal.", isCorrect: false },
      { text: "A market condition where prices are expected to fall.", isCorrect: false },
    ],
    explanation: "Contango is a market situation where the futures price of a commodity is higher than its current spot price. This difference usually includes the costs of storage, insurance, and financing (cost of carry) until the future delivery date."
  },
  {
    question: "What is the primary benefit for a retail investor investing in a Real Estate Investment Trust (REIT)?",
    options: [
      { text: "Direct ownership and management of individual commercial properties.", isCorrect: false },
      { text: "Guaranteed high returns from real estate investments.", isCorrect: false },
      { text: "Opportunity to invest in a diversified portfolio of income-generating real estate with liquidity and smaller investment size.", isCorrect: true },
      { text: "Access to investing in agricultural land and speculative projects.", isCorrect: false },
    ],
    explanation: "REITs allow retail investors to gain exposure to a diversified portfolio of income-generating real estate assets without the need for large capital or direct property management. REIT units are traded on stock exchanges, offering liquidity."
  },
  {
    question: "What is the main objective of SEBI's 'Risk-o-Meter' for mutual funds?",
    options: [
      { text: "To guarantee minimum returns for investors.", isCorrect: false },
      { text: "To categorize mutual funds by their risk level, helping investors match fund risk with their own risk appetite.", isCorrect: true },
      { text: "To predict future market trends for fund managers.", isCorrect: false },
      { text: "To measure the fund manager's performance.", isCorrect: false },
    ],
    explanation: "The Risk-o-Meter is a visual tool mandated by SEBI that classifies mutual fund schemes into six risk levels (Low to Very High). Its purpose is to provide transparency, enabling investors to make informed decisions aligned with their personal risk tolerance."
  },
  {
    question: "What is 'Rupee Cost Averaging'?",
    options: [
      { text: "A strategy to invest a large lump sum at a single market point.", isCorrect: false },
      { text: "A strategy of investing a fixed amount at regular intervals, which averages the purchase price and reduces the impact of market volatility.", isCorrect: true },
      { text: "A method to predict market peaks and troughs for optimal trading.", isCorrect: false },
      { text: "A technique to eliminate all investment risks.", isCorrect: false },
    ],
    explanation: "Rupee Cost Averaging is an investment strategy, often used with SIPs, where a fixed amount of money is invested at regular intervals. This helps reduce the average cost per unit over time, as more units are bought when prices are low and fewer when prices are high."
  },
  {
    question: "What is the primary role of a 'Depository Participant' (DP) in the Indian securities market?",
    options: [
      { text: "To provide investment advice and portfolio management services.", isCorrect: false },
      { text: "To execute buy and sell orders on behalf of investors on the stock exchange.", isCorrect: false },
      { text: "To act as an agent of the depository, facilitating Demat account opening and maintenance for investors.", isCorrect: true },
      { text: "To regulate the stock exchanges and ensure fair trading practices.", isCorrect: false },
    ],
    explanation: "A Depository Participant (DP) is an intermediary between investors and the central depositories (NSDL/CDSL). DPs are responsible for opening and maintaining Demat accounts, and facilitating the dematerialization and rematerialization of securities."
  },
  {
    question: "What is the main advantage of investing in a 'passive fund' (e.g., Index Fund, ETF) compared to an 'active fund'?",
    options: [
      { text: "Guaranteed outperformance of the market index.", isCorrect: false },
      { text: "Lower expense ratios and a strategy to replicate a market index rather than beat it.", isCorrect: true },
      { text: "Frequent trading to capitalize on short-term market movements.", isCorrect: false },
      { text: "Personalized portfolio management by an expert fund manager.", isCorrect: false },
    ],
    explanation: "Passive funds aim to track a specific market index, typically resulting in lower management fees and expense ratios compared to active funds, which employ fund managers to try and outperform the market."
  },

// --- Additional Advanced Level Questions (Set 3) ---
  {
    question: "In options trading, what does 'Theta' specifically measure?",
    options: [
      { text: "The sensitivity of an option's price to changes in market volatility.", isCorrect: false },
      { text: "The rate of change of an option's Delta with respect to the underlying asset's price.", isCorrect: false },
      { text: "The rate of decay in an option's value due to the passage of time (time decay).", isCorrect: true },
      { text: "The sensitivity of an option's price to changes in interest rates.", isCorrect: false },
    ],
    explanation: "Theta is an options Greek that quantifies time decay. It measures how much an option's theoretical value is expected to decrease for each day that passes, assuming all other factors remain constant."
  },
  {
    question: "What is the primary function of the new 'SMART ODR Portal' introduced by SEBI?",
    options: [
      { text: "To provide investment advice to retail investors in vernacular languages.", isCorrect: false },
      { text: "To facilitate online, end-to-end dispute resolution between investors and market participants.", isCorrect: true },
      { text: "To manage the listing of new companies on stock exchanges.", isCorrect: false },
      { text: "To conduct financial literacy workshops across India.", isCorrect: false },
    ],
    explanation: "The SMART ODR (Securities Market Approach for Resolution Through Online Dispute Resolution) Portal is a centralized online platform established by Market Infrastructure Institutions under SEBI's guidance to resolve investor disputes efficiently through pre-conciliation, conciliation, and arbitration."
  },
  {
    question: "What is 're-pledge' in the context of margin payments for securities?",
    options: [
      { text: "An illegal activity where a broker sells a client's pledged shares without consent.", isCorrect: false },
      { text: "The act of a stockbroker pledging client securities (received as pledge) to a Clearing Member or Clearing Corporation to obtain margins.", isCorrect: true },
      { text: "A transaction that transfers ownership of a client's shares to the broker for a fee.", isCorrect: false },
      { text: "The client pledging the same securities with multiple brokers simultaneously.", isCorrect: false },
    ],
    explanation: "Re-pledge is a legitimate process where a stockbroker, with the client's consent, further pledges the securities they received from the client as collateral to a Clearing Member or Clearing Corporation. This allows the broker to meet their margin requirements."
  },
  {
    question: "What is a key limitation of investing in an 'Alternative Investment Fund' (AIF)?",
    options: [
      { text: "AIFs are publicly traded and highly liquid, making them prone to market volatility.", isCorrect: false },
      { text: "AIFs offer guaranteed fixed returns, which are often lower than traditional investments.", isCorrect: false },
      { text: "AIFs are privately pooled and generally illiquid investment vehicles, with no secondary market for trading their units.", isCorrect: true },
      { text: "AIFs are regulated by the Reserve Bank of India (RBI), which limits their investment options.", isCorrect: false },
    ],
    explanation: "A significant limitation of AIFs is their illiquid nature. As privately pooled vehicles, their units are not typically traded on public exchanges, making it difficult for investors to exit their investments quickly or at a desired price."
  },
  {
    question: "What is 'backwardation' in futures trading?",
    options: [
      { text: "A market condition where the futures price is higher than the spot price.", isCorrect: false },
      { text: "A market condition where the spot price is higher than the futures price.", isCorrect: true },
      { text: "A situation where spot and futures prices are identical.", isCorrect: false },
      { text: "A term describing a market with extremely low volatility.", isCorrect: false },
    ],
    explanation: "Backwardation is a market structure where the current spot price of a commodity is higher than its futures price. This typically indicates a strong immediate demand or a perceived shortage of the commodity in the present."
  },
  {
    question: "In options trading, what does 'Gamma' measure?",
    options: [
      { text: "The rate of decay of an option's value due to time passage.", isCorrect: false },
      { text: "The sensitivity of an option's price to changes in market volatility.", isCorrect: false },
      { text: "The rate of change of an option's Delta with respect to a change in the underlying asset's price.", isCorrect: true },
      { text: "The sensitivity of an option's price to changes in interest rates.", isCorrect: false },
    ],
    explanation: "Gamma is an options Greek that measures the rate at which an option's Delta changes for every one-point movement in the underlying asset's price. It indicates the convexity of the option's price curve."
  },
  {
    question: "What is the primary objective of the 'Investor Charter' published by SEBI and other market intermediaries?",
    options: [
      { text: "To replace all existing securities market regulations with a single document.", isCorrect: false },
      { text: "To provide a list of top-performing investment products for investors.", isCorrect: false },
      { text: "To promote transparency, enhance investor awareness, and build trust and confidence in the securities market.", isCorrect: true },
      { text: "To mandate specific investment strategies for all retail investors.", isCorrect: false },
    ],
    explanation: "The Investor Charter outlines the rights and responsibilities of investors, services they can avail, and grievance redressal mechanisms. Its core purpose is to foster a transparent and trustworthy environment, thereby boosting investor confidence and awareness."
  },
  {
    question: "What is 'Haircut' in the context of margin payments for pledged securities?",
    options: [
      { text: "A fixed fee charged by the stockbroker for managing pledged assets.", isCorrect: false },
      { text: "The interest rate applied to the loan amount against pledged securities.", isCorrect: false },
      { text: "The percentage reduction applied to the market value of pledged shares to determine their collateral value for margin purposes.", isCorrect: true },
      { text: "A penalty for failing to deliver pledged securities on time.", isCorrect: false },
    ],
    explanation: "A haircut is a risk management tool. It is a percentage by which the market value of securities pledged as collateral for margin is reduced. This reduction accounts for potential price volatility, ensuring that the collateral provides adequate cover even if the market moves unfavorably."
  },
  {
    question: "Who is primarily responsible for monitoring market abuses such as circular trading, price rigging, and price manipulation in the Indian securities market?",
    options: [
      { text: "Individual investors through self-reporting mechanisms.", isCorrect: false },
      { text: "Stockbrokers' internal compliance departments only.", isCorrect: false },
      { text: "The respective stock exchanges, under the regulatory oversight of SEBI.", isCorrect: true },
      { text: "The Ministry of Corporate Affairs (MCA).", isCorrect: false },
    ],
    explanation: "Stock exchanges play a crucial role in maintaining market integrity. Under SEBI's regulatory framework, they are primarily responsible for surveillance of trading activities to detect and prevent market abuses like circular trading and price manipulation."
  },
  {
    question: "What is the key difference between the old Online Dispute Resolution (ODR) mechanism and the new SMART ODR portal?",
    options: [
      { text: "The old mechanism was a single-step process, while the new one is multi-layered.", isCorrect: false },
      { text: "The old mechanism was largely offline and fragmented, while SMART ODR is an end-to-end online, common portal for dispute resolution across Market Infrastructure Institutions (MIIs).", isCorrect: true },
      { text: "The old mechanism was free for all investors, while SMART ODR charges fees from the initial stage.", isCorrect: false },
      { text: "SMART ODR is only for institutional investors, unlike the old ODR.", isCorrect: false },
    ],
    explanation: "The new SMART ODR portal is a significant upgrade, offering a centralized, end-to-end online platform for dispute resolution. The old mechanism was often manual, lacked uniformity, and was less efficient compared to the integrated online approach of SMART ODR."
  },
  // data/comprehensiveQuestions.js
// Append these 30 new questions to your existing 'export const comprehensiveQuestions = [...]' array.

// ... (Your existing 140 questions from previous parts should be here) ...

// --- Additional Beginner Level Questions (Set 5 - Unique) ---
  {
    question: "What is the primary purpose of a 'Fixed Deposit (FD) Account'?",
    options: [
      { text: "To provide high liquidity for daily transactions.", isCorrect: false },
      { text: "To place funds with a bank for a fixed term at a predetermined interest rate.", isCorrect: true },
      { text: "To invest directly in the stock market.", isCorrect: false },
      { text: "To get a credit card.", isCorrect: false },
    ],
    explanation: "A Fixed Deposit (FD) allows you to deposit a lump sum of money for a specific period, earning a fixed rate of interest, which is typically higher than a savings account."
  },
  {
    question: "What is 'Capital Appreciation' in investments?",
    options: [
      { text: "Receiving regular interest payments.", isCorrect: false },
      { text: "The increase in the market value of an investment over time.", isCorrect: true },
      { text: "A fixed income from government bonds.", isCorrect: false },
      { text: "The total amount of dividends received.", isCorrect: false },
    ],
    explanation: "Capital appreciation occurs when the market value of an asset (like stocks or real estate) rises above its original purchase price. Investors realize this gain when they sell the asset."
  },
  {
    question: "Which of the following is a 'hard commodity'?",
    options: [
      { text: "Coffee.", isCorrect: false },
      { text: "Cotton.", isCorrect: false },
      { text: "Copper.", isCorrect: true },
      { text: "Sugar.", isCorrect: false },
    ],
    explanation: "Hard commodities are natural resources that are mined or extracted, such as metals (copper, gold, silver) and energy products (crude oil, natural gas)."
  },
  {
    question: "What is the primary objective of a 'mutual fund'?",
    options: [
      { text: "To guarantee returns to all investors.", isCorrect: false },
      { text: "To pool money from investors and invest in a diversified portfolio of securities.", isCorrect: true },
      { text: "To provide direct loans to individuals.", isCorrect: false },
      { text: "To regulate the stock market.", isCorrect: false },
    ],
    explanation: "A mutual fund collects money from multiple investors and invests it across various securities (stocks, bonds, etc.) according to a stated objective, offering diversification and professional management."
  },
  {
    question: "What does a 'bear market' typically indicate?",
    options: [
      { text: "A period of rising prices and investor optimism.", isCorrect: false },
      { text: "A market where prices are falling or expected to fall, with investor pessimism.", isCorrect: true },
      { text: "A market with stable prices and high trading volume.", isCorrect: false },
      { text: "A market exclusive to small individual investors.", isCorrect: false },
    ],
    explanation: "A bear market is characterized by declining stock prices and widespread investor pessimism, often reflecting a weak economy or negative corporate outlook."
  },
  {
    question: "What is the 'Rule of 72' used to estimate?",
    options: [
      { text: "The number of years it takes for an investment to double in value.", isCorrect: true },
      { text: "The amount of interest earned in a single year.", isCorrect: false },
      { text: "The optimal portfolio diversification strategy.", isCorrect: false },
      { text: "The risk level of an investment.", isCorrect: false },
    ],
    explanation: "The Rule of 72 is a simple way to estimate the doubling time of an investment. You divide 72 by the annual interest rate to get the approximate number of years."
  },
  {
    question: "What is 'EMI' (Equated Monthly Installment)?",
    options: [
      { text: "A one-time payment for a loan.", isCorrect: false },
      { text: "A fixed payment made by a borrower to a lender each month, covering principal and interest.", isCorrect: true },
      { text: "The total amount of interest paid over the life of a loan.", isCorrect: false },
      { text: "An initial deposit required for a loan.", isCorrect: false },
    ],
    explanation: "EMI is a common method for loan repayment, where the borrower pays a consistent amount each month. This payment includes both a portion of the principal loan amount and the interest accrued."
  },
  {
    question: "What is the primary purpose of a 'budget' in personal finance?",
    options: [
      { text: "To identify new ways to borrow money.", isCorrect: false },
      { text: "To track income and expenses, plan for future financial goals, and control spending.", isCorrect: true },
      { text: "To avoid paying taxes on your income.", isCorrect: false },
      { text: "To make impulsive spending decisions.", isCorrect: false },
    ],
    explanation: "A budget is a fundamental tool for managing personal finances. It helps you understand your financial inflows and outflows, enabling you to make informed decisions about saving, spending, and investing."
  },
  {
    question: "What is 'inflation'?",
    options: [
      { text: "A decrease in the general price level.", isCorrect: false },
      { text: "A sustained increase in the general price level of goods and services, leading to reduced purchasing power.", isCorrect: true },
      { text: "A period of rapid economic growth.", isCorrect: false },
      { text: "An increase in the value of a country's currency.", isCorrect: false },
    ],
    explanation: "Inflation is the rate at which the average prices of goods and services increase over time. High inflation erodes the value of money, making it crucial for investments to generate returns that outpace it."
  },
  {
    question: "What does 'liquidity' mean for an investment?",
    options: [
      { text: "The potential for the investment to generate high returns.", isCorrect: false },
      { text: "The ease and speed with which an investment can be converted into cash without significant loss of value.", isCorrect: true },
      { text: "The stability of the investment's value.", isCorrect: false },
      { text: "The amount of debt associated with the investment.", isCorrect: false },
    ],
    explanation: "Liquidity is a key characteristic of an asset. A highly liquid asset can be quickly sold or exchanged for cash at its fair market value, such as money in a savings account. Illiquid assets, like real estate, take longer to convert to cash."
  },

// --- Additional Intermediate Level Questions (Set 5 - Unique) ---
  {
    question: "What is the primary function of the 'ASBA' (Application Supported by Blocked Amount) facility in public issues?",
    options: [
      { text: "To guarantee allotment of shares to all applicants.", isCorrect: false },
      { text: "To block the application money in the investor's bank account, earning interest until allotment, and debiting only upon successful allotment.", isCorrect: true },
      { text: "To allow investors to pay for shares in cash.", isCorrect: false },
      { text: "To provide a loan to investors for applying in IPOs.", isCorrect: false },
    ],
    explanation: "ASBA streamlines the IPO application process. It ensures that your funds remain in your bank account, earning interest, until the shares are actually allotted. Only then is the money debited."
  },
  {
    question: "What is 'Backwardation' in futures trading?",
    options: [
      { text: "A market where the futures price is higher than the spot price.", isCorrect: false },
      { text: "A market where the spot price is higher than the futures price, often signaling immediate demand or scarcity.", isCorrect: true },
      { text: "A condition where spot and futures prices are equal.", isCorrect: false },
      { text: "A term for a highly volatile market.", isCorrect: false },
    ],
    explanation: "Backwardation is a market condition where the current spot price of a commodity is higher than its futures price. This can indicate a strong immediate demand for the commodity or a perceived shortage in the near term, making prompt delivery more valuable."
  },
  {
    question: "What is the key advantage of a 'Direct Plan' in a mutual fund scheme?",
    options: [
      { text: "It offers personalized financial advice from a distributor.", isCorrect: false },
      { text: "It has a lower expense ratio due to the absence of distributor commissions, potentially leading to higher returns.", isCorrect: true },
      { text: "It guarantees higher returns than a 'Regular Plan'.", isCorrect: false },
      { text: "It allows for cash transactions without KYC.", isCorrect: false },
    ],
    explanation: "Direct Plans bypass intermediaries, meaning investors do not pay distributor commissions. This directly reduces the expense ratio of the fund, leading to potentially higher net returns for the investor compared to a Regular Plan."
  },
  {
    question: "What is the significance of the 'Record Date' in a Rights Issue?",
    options: [
      { text: "It is the date when the new shares are listed on the exchange.", isCorrect: false },
      { text: "It is the date for determining shareholders eligible to participate in the Rights Issue.", isCorrect: true },
      { text: "It is the date when the application money is debited from the bank account.", isCorrect: false },
      { text: "It is the date by which all applications must be submitted.", isCorrect: false },
    ],
    explanation: "The Record Date is a specific date set by the company to identify which existing shareholders are eligible to receive the offer of new shares in a Rights Issue. Only shareholders on record as of this date are entitled to participate."
  },
  {
    question: "What is the primary benefit for a retail investor purchasing units of an 'Infrastructure Investment Trust (InvIT)'?",
    options: [
      { text: "Direct ownership and management of individual infrastructure projects.", isCorrect: false },
      { text: "Guaranteed high returns from infrastructure projects.", isCorrect: false },
      { text: "Opportunity to invest in a diversified portfolio of income-generating infrastructure assets with liquidity and smaller investment size.", isCorrect: true },
      { text: "Access to investing in speculative land development.", isCorrect: false },
    ],
    explanation: "InvITs allow retail investors to gain exposure to a diversified portfolio of income-generating infrastructure assets (like roads, power plants) without requiring large capital. They offer liquidity (as units are traded) and professional management."
  },
  {
    question: "What is the main advantage of 'Rupee Cost Averaging' in volatile markets?",
    options: [
      { text: "It allows investors to always buy at the lowest price.", isCorrect: false },
      { text: "It helps reduce the average cost of investment per unit over time by buying more units when prices are low and fewer when high.", isCorrect: true },
      { text: "It guarantees higher returns in the short term.", isCorrect: false },
      { text: "It eliminates the need for market research.", isCorrect: false },
    ],
    explanation: "Rupee Cost Averaging is an investment strategy, often used with SIPs, where a fixed amount of money is invested at regular intervals. This helps reduce the average cost per unit over time, as more units are bought when prices are down and fewer when prices are up, thereby averaging out your purchase cost."
  },
  {
    question: "What is the primary function of a 'Depository Participant' (DP) in the Indian securities market?",
    options: [
      { text: "To provide investment advice and portfolio management services.", isCorrect: false },
      { text: "To execute buy and sell orders on behalf of investors on the stock exchange.", isCorrect: false },
      { text: "To act as an agent of the depository, facilitating Demat account opening and maintenance for investors.", isCorrect: true },
      { text: "To regulate the stock exchanges and ensure fair trading practices.", isCorrect: false },
    ],
    explanation: "A Depository Participant (DP) is an intermediary between investors and the central depositories (NSDL/CDSL). DPs are responsible for opening and maintaining Demat accounts, and facilitating the dematerialization and rematerialization of securities."
  },
  {
    question: "What does an 'open-ended fund' primarily offer to investors?",
    options: [
      { text: "A fixed maturity period and listing on a stock exchange.", isCorrect: false },
      { text: "Investment opportunities only during an initial offer period.", isCorrect: false },
      { text: "Continuous subscription and repurchase at a daily declared NAV, providing high liquidity.", isCorrect: true },
      { text: "Exclusive investment in the largest companies in the market.", isCorrect: false },
    ],
    explanation: "Open-ended funds are characterized by continuous availability for investors to buy and sell units at the prevailing Net Asset Value (NAV). This structure provides high liquidity and no fixed maturity date, making them flexible for investors."
  },
  {
    question: "What is the consequence of failing to provide a 'Record Date' in a 'Tender Offer' for buyback?",
    options: [
      { text: "All shareholders are automatically eligible to tender their shares.", isCorrect: true },
      { text: "The tender offer is canceled.", isCorrect: false },
      { text: "The offer period is extended to accommodate all investors.", isCorrect: false },
      { text: "The Record Date is not applicable for a Tender Offer for buyback.", isCorrect: false },
    ],
    explanation: "In a Tender Offer for buyback, a Record Date is essential to determine which shareholders are eligible to participate and calculate their entitlement ratio. If a record date is not provided, all shareholders become eligible to tender their shares."
  },
  {
    question: "How can an investor verify the status of their trades on a stock exchange?",
    options: [
      { text: "By checking their bank statement.", isCorrect: false },
      { text: "By verifying the details on the stockbroker's website only.", isCorrect: false },
      { text: "By checking the trade verification module on the stock exchange's website using their details, as the data is available from the next trading day (T+1).", isCorrect: true },
      { text: "By waiting for a physical letter from the stock exchange.", isCorrect: false },
    ],
    explanation: "Investors can verify their trades using the trade verification module on the stock exchange's website, where data is typically available from the next trading day (T+1). This allows for reconciliation with the contract note from the broker."
  },

// --- Additional Advanced Level Questions (Set 5 - Unique) ---
  {
    question: "In options trading, what does 'Rho' specifically measure?",
    options: [
      { text: "The sensitivity of an option's price to changes in market volatility.", isCorrect: false },
      { text: "The rate of decay of an option's value due to the passage of time.", isCorrect: false },
      { text: "The sensitivity of an option's price to changes in interest rates.", isCorrect: true },
      { text: "The rate of change of an option's Delta.", isCorrect: false },
    ],
    explanation: "Rho is an options Greek that measures the sensitivity of an option's price to changes in the risk-free interest rate. A positive Rho for a call option means its value increases with rising interest rates."
  },
  {
    question: "What is the primary function of the new 'SMART ODR Portal' introduced by SEBI?",
    options: [
      { text: "To provide investment advice to retail investors in vernacular languages.", isCorrect: false },
      { text: "To facilitate online, end-to-end dispute resolution between investors and market participants.", isCorrect: true },
      { text: "To manage the listing of new companies on stock exchanges.", isCorrect: false },
      { text: "To conduct financial literacy workshops across India.", isCorrect: false },
    ],
    explanation: "The SMART ODR (Securities Market Approach for Resolution Through Online Dispute Resolution) Portal is a centralized online platform established by Market Infrastructure Institutions under SEBI's guidance to resolve investor disputes efficiently through pre-conciliation, conciliation, and arbitration."
  },
  {
    question: "What is 're-pledge' in the context of margin payments for securities?",
    options: [
      { text: "An illegal activity where a broker sells a client's pledged shares without consent.", isCorrect: false },
      { text: "The act of a stockbroker pledging client securities (received as pledge) to a Clearing Member or Clearing Corporation to obtain margins.", isCorrect: true },
      { text: "A transaction that transfers ownership of a client's shares to the broker for a fee.", isCorrect: false },
      { text: "The client pledging the same securities with multiple brokers simultaneously.", isCorrect: false },
    ],
    explanation: "Re-pledge is a legitimate process where a stockbroker, with the client's consent, further pledges the securities they received from the client as collateral to a Clearing Member or Clearing Corporation. This allows the broker to meet their own margin requirements."
  },
  {
    question: "What is a key limitation of investing in an 'Alternative Investment Fund (AIF)'?",
    options: [
      { text: "AIFs are publicly traded and highly liquid investment instruments.", isCorrect: false },
      { text: "AIFs offer guaranteed fixed returns, which are often lower than traditional investments.", isCorrect: false },
      { text: "AIFs are privately pooled and generally illiquid investment vehicles, with no secondary market for trading their units.", isCorrect: true },
      { text: "AIFs are regulated by the Reserve Bank of India (RBI) and are therefore very low risk.", isCorrect: false },
    ],
    explanation: "A significant limitation of AIFs is their illiquid nature. As privately pooled vehicles, their units are not publicly traded, making it difficult for investors to exit their investments quickly or at a desired price."
  },
  {
    question: "What is 'backwardation' in futures trading?",
    options: [
      { text: "A market condition where the futures price is higher than the spot price.", isCorrect: false },
      { text: "A market condition where the spot price is higher than the futures price.", isCorrect: true },
      { text: "A situation where spot and futures prices are identical.", isCorrect: false },
      { text: "A term describing a market with extremely low volatility.", isCorrect: false },
    ],
    explanation: "Backwardation is a market structure where the current spot price of a commodity is higher than its futures price. This can signal an immediate scarcity or high demand for the commodity, making it more expensive for prompt delivery."
  },
  {
    question: "In options trading, what does 'Gamma' measure?",
    options: [
      { text: "The rate of decay of an option's value due to time passage.", isCorrect: false },
      { text: "The sensitivity of an option's price to changes in market volatility.", isCorrect: false },
      { text: "The rate of change of an option's Delta with respect to a change in the underlying asset's price.", isCorrect: true },
      { text: "The sensitivity of an option's price to changes in interest rates.", isCorrect: false },
    ],
    explanation: "Gamma is an options Greek that measures the rate at which an option's Delta changes for every one-point movement in the underlying asset's price. It indicates the convexity of the option's price curve, showing how quickly Delta itself is expected to change."
  },
  {
    question: "What is the primary objective of the 'Investor Charter' published by SEBI and other market intermediaries?",
    options: [
      { text: "To replace all existing securities market regulations with a single document.", isCorrect: false },
      { text: "To promote transparency, enhance investor awareness, and build trust and confidence in the securities market.", isCorrect: true },
      { text: "To mandate specific investment strategies for all retail investors.", isCorrect: false },
      { text: "To provide a list of top-performing investment products for investors.", isCorrect: false },
    ],
    explanation: "The Investor Charter aims to empower investors by clearly outlining their rights and responsibilities, detailing available services, and explaining grievance redressal mechanisms, thereby fostering a transparent and trustworthy market environment."
  },
  {
    question: "What is 'Haircut' in the context of margin payments for pledged securities?",
    options: [
      { text: "A fixed brokerage commission for pledging securities.", isCorrect: false },
      { text: "The interest rate charged on the loan taken against pledged securities.", isCorrect: false },
      { text: "The percentage reduction applied to the market value of pledged shares to determine their collateral value for margin purposes.", isCorrect: true },
      { text: "A penalty imposed for failing to maintain sufficient margin.", isCorrect: false },
    ],
    explanation: "A haircut is a risk control measure used by exchanges and clearing corporations. It's a percentage reduction applied to the market value of securities pledged as collateral to account for potential price fluctuations, ensuring that the collateral provides adequate cover even if the market moves unfavorably."
  }
  ]
};

function QuizScreen({ route, navigation }) {
  const { userProgress, setUserProgress } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = QUIZ_DATA.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUIZ_DATA.questions.length - 1;

  const handleOptionSelect = (index) => {
    if (!showFeedback) {
      setSelectedOptionIndex(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null) {
      Alert.alert("Select an Option", "Please select an answer before submitting.");
      return;
    }
    setShowFeedback(true);
    if (currentQuestion.options[selectedOptionIndex].isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOptionIndex(null);
      setShowFeedback(false);
    } else {
      setQuizCompleted(true);
      const updatedProgress = {
        ...userProgress,
        totalQuizScore: (userProgress.totalQuizScore || 0) + score,
        completedQuizzes: (userProgress.completedQuizzes || 0) + 1,
        timestamp: Date.now(),
      };
      setUserProgress(updatedProgress);
      AsyncStorage.setItem(USER_PROGRESS_STORAGE_KEY, JSON.stringify(updatedProgress));

      Alert.alert(
        "Quiz Completed!",
        `You scored ${score} out of ${QUIZ_DATA.questions.length}!`,
        [{
          text: "OK", onPress: () => {
            navigation.popToTop();
            navigation.navigate('Dashboard');
          }
        }]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.quizTitle}>{QUIZ_DATA.title}</Text>
      <Text style={styles.questionNumber}>
        Question {currentQuestionIndex + 1} of {QUIZ_DATA.questions.length}
      </Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOptionIndex === index && styles.selectedOption,
              showFeedback && option.isCorrect && styles.correctOption,
              showFeedback && selectedOptionIndex === index && !option.isCorrect && styles.incorrectOption,
            ]}
            onPress={() => handleOptionSelect(index)}
            disabled={showFeedback || quizCompleted}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}

        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>
              {currentQuestion.options[selectedOptionIndex].isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
            </Text>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          {!showFeedback ? (
            <TouchableOpacity
              style={[styles.submitButton, selectedOptionIndex === null ? styles.submitButtonDisabled : {}]}
              onPress={handleSubmitAnswer}
              disabled={selectedOptionIndex === null || quizCompleted}
            >
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextQuestion}
              disabled={quizCompleted}
            >
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 15,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  quizTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
    textAlign: 'center',
  },
  questionNumber: {
    fontSize: 16,
    color: '#667788',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#e0f7fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#b3e0ff',
  },
  selectedOption: {
    borderColor: '#007bff',
    backgroundColor: '#cce5ff',
  },
  correctOption: {
    backgroundColor: '#e6ffe6',
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#ffe6e6',
    borderColor: '#f44336',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  feedbackContainer: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  explanationText: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizScreen;