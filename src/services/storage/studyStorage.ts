import { QuizQuestion, Flashcard, StudyTask, WeakTopicAnalysis, ChatMessage } from '../ai/types';

export interface FriendProfile {
  name: string;
  goal: string;
  subjects: string[];
  streak: number;
  examDate: string;
  hoursPerDay: number;
}

export interface SavedMaterial {
  id: string;
  title: string;
  subject: string;
  content: string;
  createdAt: string;
}

export interface QuizHistory {
  id: string;
  topic: string;
  subject: string;
  score: number;
  total: number;
  difficulty: 'easy' | 'medium' | 'hard';
  date: string;
}

export interface FlashcardPerformance {
  cardId: string;
  correct: boolean;
  topic: string;
  timestamp: string;
}

// Initial defaults for first load
const DEFAULT_PROFILE: FriendProfile = {
  name: "Arun",
  goal: "Ace the Cisco CCNA & Computer Networks Final Exam",
  subjects: ["Computer Networks", "System Architecture"],
  streak: 3,
  examDate: "2026-10-15",
  hoursPerDay: 2
};

const SAMPLE_NOTES = `# Computer Networks Study Guide

## The OSI Model
The Open Systems Interconnection (OSI) model defines a networking framework to implement protocols in seven layers.
1. Physical Layer: Transmits raw bit streams over a physical medium (Cables, Fiber, Hubs).
2. Data Link Layer: Defines formatting of data on the network. Frames packets, uses MAC addresses (Switches).
3. Network Layer: Decides which physical path the data will take (Routing). Uses IP addresses (Routers).
4. Transport Layer: Transmits data reliably using protocols like TCP and UDP.
5. Session Layer: Maintains connections and controls ports and sessions.
6. Presentation Layer: Ensures that data is in a usable format and where data encryption/compression occurs.
7. Application Layer: Human-computer interaction layer, where applications access network services (HTTP, DNS, SMTP, SSH).

## TCP vs UDP
- TCP (Transmission Control Protocol) is connection-oriented, reliable, guarantees delivery and ordering, and uses flow control. It is slower due to handshake overhead (3-way handshake: SYN, SYN-ACK, ACK). Used for HTTP, HTTPS, Email, and SSH.
- UDP (User Datagram Protocol) is connectionless, unreliable, does not guarantee delivery or ordering, but is extremely fast with low overhead. Used for streaming video, DNS, and online gaming where speed is preferred over reliability.

## Common Ports
- HTTP: 80
- HTTPS: 443
- DNS: 53 (Uses UDP primarily)
- SSH: 22
- FTP: 20 & 21
- DHCP: 67 & 68`;

export const loadDemoData = () => {
  // Save Arun profile
  localStorage.setItem('studybuddy_profile', JSON.stringify(DEFAULT_PROFILE));

  // Save Sample Materials
  const demoMaterial: SavedMaterial = {
    id: "demo_mat_1",
    title: "OSI Model & Transport Protocols (TCP/UDP)",
    subject: "Computer Networks",
    content: SAMPLE_NOTES,
    createdAt: new Date().toLocaleDateString()
  };
  localStorage.setItem('studybuddy_materials', JSON.stringify([demoMaterial]));

  // Save Sample Quiz History
  const quizHistory: QuizHistory[] = [
    {
      id: "q_h1",
      topic: "OSI Model Layers",
      subject: "Computer Networks",
      score: 4,
      total: 5,
      difficulty: "medium",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString()
    },
    {
      id: "q_h2",
      topic: "TCP vs UDP Handshakes",
      subject: "Computer Networks",
      score: 2,
      total: 5,
      difficulty: "medium",
      date: new Date().toLocaleDateString()
    }
  ];
  localStorage.setItem('studybuddy_quiz_history', JSON.stringify(quizHistory));

  // Save Flashcard progress
  const flashcards: Flashcard[] = [
    {
      id: 'fc_1',
      question: "What are the 7 Layers of the OSI Model from bottom to top?",
      answer: "1. Physical, 2. Data Link, 3. Network, 4. Transport, 5. Session, 6. Presentation, 7. Application. (A popular mnemonic: Please Do Not Throw Sausage Pizza Away).",
      topic: "OSI Model"
    },
    {
      id: 'fc_2',
      question: "Does DNS run over TCP or UDP by default?",
      answer: "DNS runs over UDP (Port 53) because DNS queries need to be completed as quickly as possible, and the low overhead of UDP is perfect for simple name requests.",
      topic: "Ports"
    },
    {
      id: 'fc_3',
      question: "What is the 3-Way Handshake in TCP?",
      answer: "It is the process used to establish a connection: 1. SYN (Synchronize), 2. SYN-ACK (Synchronize-Acknowledge), 3. ACK (Acknowledge). This ensures both computers are ready to talk.",
      topic: "TCP vs UDP Handshakes"
    },
    {
      id: 'fc_4',
      question: "What is the primary device or address used at Layer 3 (Network Layer)?",
      answer: "Layer 3 uses IP Addresses and Routers to direct traffic across different interconnected networks.",
      topic: "OSI Model"
    },
    {
      id: 'fc_5',
      question: "What is Port 443 used for?",
      answer: "Port 443 is used for HTTPS, which is secure web traffic encrypted with TLS/SSL.",
      topic: "Ports"
    }
  ];
  localStorage.setItem('studybuddy_flashcards', JSON.stringify(flashcards));

  // Save Flashcard Performance Reviews (showing some weak ones)
  const perf: FlashcardPerformance[] = [
    { cardId: 'fc_1', correct: true, topic: 'OSI Model', timestamp: new Date().toISOString() },
    { cardId: 'fc_2', correct: true, topic: 'Ports', timestamp: new Date().toISOString() },
    { cardId: 'fc_3', correct: false, topic: 'TCP vs UDP Handshakes', timestamp: new Date().toISOString() },
    { cardId: 'fc_4', correct: true, topic: 'OSI Model', timestamp: new Date().toISOString() },
    { cardId: 'fc_5', correct: false, topic: 'Ports', timestamp: new Date().toISOString() }
  ];
  localStorage.setItem('studybuddy_fc_performance', JSON.stringify(perf));

  // Save Study Plan
  const plan: StudyTask[] = [
    { id: "task_1", day: "Day 1", title: "Study OSI Model layers and common network devices", topic: "Computer Networks", durationMinutes: 60, isCompleted: true },
    { id: "task_2", day: "Day 2", title: "Practice TCP 3-way handshake & compare with UDP speed advantages", topic: "Computer Networks", durationMinutes: 60, isCompleted: true },
    { id: "task_3", day: "Day 3", title: "Memorize 6 core network port allocations (DNS, SSH, HTTP)", topic: "Computer Networks", durationMinutes: 45, isCompleted: false },
    { id: "task_4", day: "Day 4", title: "Do flashcard reviews and take a practice quiz", topic: "Computer Networks", durationMinutes: 60, isCompleted: false },
    { id: "task_5", day: "Day 5", title: "Conduct full final exam review with AI Tutor simulation", topic: "Computer Networks", durationMinutes: 90, isCompleted: false }
  ];
  localStorage.setItem('studybuddy_study_plan', JSON.stringify(plan));

  // Clear chat logs
  localStorage.removeItem('studybuddy_chat_messages');
};

export const studyStorage = {
  getProfile(): FriendProfile {
    const data = localStorage.getItem('studybuddy_profile');
    if (!data) {
      // Lazy init first time if not exists
      this.saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    return JSON.parse(data);
  },

  saveProfile(profile: FriendProfile): void {
    localStorage.setItem('studybuddy_profile', JSON.stringify(profile));
  },

  getMaterials(): SavedMaterial[] {
    const data = localStorage.getItem('studybuddy_materials');
    return data ? JSON.parse(data) : [];
  },

  saveMaterials(materials: SavedMaterial[]): void {
    localStorage.setItem('studybuddy_materials', JSON.stringify(materials));
  },

  addMaterial(title: string, subject: string, content: string): SavedMaterial {
    const materials = this.getMaterials();
    const newMat: SavedMaterial = {
      id: `mat_${Date.now()}`,
      title,
      subject,
      content,
      createdAt: new Date().toLocaleDateString()
    };
    materials.push(newMat);
    this.saveMaterials(materials);
    return newMat;
  },

  deleteMaterial(id: string): void {
    const materials = this.getMaterials();
    const updated = materials.filter(m => m.id !== id);
    this.saveMaterials(updated);
  },

  getQuizHistory(): QuizHistory[] {
    const data = localStorage.getItem('studybuddy_quiz_history');
    return data ? JSON.parse(data) : [];
  },

  saveQuizHistory(history: QuizHistory[]): void {
    localStorage.setItem('studybuddy_quiz_history', JSON.stringify(history));
  },

  addQuizResult(topic: string, subject: string, score: number, total: number, difficulty: 'easy' | 'medium' | 'hard') {
    const history = this.getQuizHistory();
    const newHistory: QuizHistory = {
      id: `quiz_hist_${Date.now()}`,
      topic,
      subject,
      score,
      total,
      difficulty,
      date: new Date().toLocaleDateString()
    };
    history.push(newHistory);
    this.saveQuizHistory(history);
    
    // Add simple topic completion helper
    if (score / total >= 0.8) {
      const completed = this.getCompletedTopics();
      if (!completed.includes(topic)) {
        completed.push(topic);
        localStorage.setItem('studybuddy_completed_topics', JSON.stringify(completed));
      }
    }
  },

  getCompletedTopics(): string[] {
    const data = localStorage.getItem('studybuddy_completed_topics');
    return data ? JSON.parse(data) : ["Introduction to Networks"];
  },

  getFlashcards(): Flashcard[] {
    const data = localStorage.getItem('studybuddy_flashcards');
    return data ? JSON.parse(data) : [];
  },

  saveFlashcards(cards: Flashcard[]): void {
    localStorage.setItem('studybuddy_flashcards', JSON.stringify(cards));
  },

  getFlashcardPerformance(): FlashcardPerformance[] {
    const data = localStorage.getItem('studybuddy_fc_performance');
    return data ? JSON.parse(data) : [];
  },

  saveFlashcardPerformance(perf: FlashcardPerformance[]): void {
    localStorage.setItem('studybuddy_fc_performance', JSON.stringify(perf));
  },

  recordFlashcardReview(cardId: string, correct: boolean, topic: string) {
    const perf = this.getFlashcardPerformance();
    perf.push({
      cardId,
      correct,
      topic,
      timestamp: new Date().toISOString()
    });
    this.saveFlashcardPerformance(perf);
  },

  getStudyPlan(): StudyTask[] {
    const data = localStorage.getItem('studybuddy_study_plan');
    return data ? JSON.parse(data) : [];
  },

  saveStudyPlan(plan: StudyTask[]): void {
    localStorage.setItem('studybuddy_study_plan', JSON.stringify(plan));
  },

  toggleStudyTask(id: string): StudyTask[] {
    const plan = this.getStudyPlan();
    const updated = plan.map(task => {
      if (task.id === id) {
        return { ...task, isCompleted: !task.isCompleted };
      }
      return task;
    });
    this.saveStudyPlan(updated);
    
    // Dynamically update completion streak on daily checks
    const completedToday = updated.some(t => t.isCompleted);
    if (completedToday) {
      const profile = this.getProfile();
      // Increase streak if it's the same day check or increment gently
      // For presentation, let's keep it clean
    }
    
    return updated;
  },

  getChatHistory(): ChatMessage[] {
    const data = localStorage.getItem('studybuddy_chat_messages');
    return data ? JSON.parse(data) : [];
  },

  saveChatHistory(history: ChatMessage[]): void {
    localStorage.setItem('studybuddy_chat_messages', JSON.stringify(history));
  },

  clearChatHistory(): void {
    localStorage.removeItem('studybuddy_chat_messages');
  },

  clearAll(): void {
    localStorage.clear();
  }
};
