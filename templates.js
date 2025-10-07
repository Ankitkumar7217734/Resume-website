// LaTeX Templates (Simplified for browser compatibility)
const TEMPLATES = {
    article: String.raw`\documentclass{article}

\title{Your Article Title}
\author{Your Name}

\begin{document}
\maketitle

\section{Introduction}
This is the introduction section.

\section{Main Content}
This is where the main body goes.

\begin{itemize}
    \item First item
    \item Second item
\end{itemize}

\section{Conclusion}
Summarize your main points here.

\end{document}`,

    report: String.raw`\documentclass{report}

\title{Report Title}
\author{Your Name}

\begin{document}
\maketitle

\chapter{Introduction}
This is the first chapter.

\chapter{Conclusion}
Summary of your work.

\end{document}`,

    letter: String.raw`\documentclass{letter}

\signature{Your Name}
\address{Your Address}

\begin{document}

\begin{letter}{Recipient Name}

\opening{Dear Sir/Madam,}

This is the body of your letter.

\closing{Sincerely,}

\end{letter}
\end{document}`,

    resume: String.raw`\documentclass{article}

\begin{document}

\begin{center}
{\Large \textbf{Your Full Name}}\\[0.3cm]
Email: your.email@example.com | Phone: +1-234-567-8900
\end{center}

\section*{Professional Profile}
Experienced professional with expertise in your field.

\section*{Education}
\textbf{University Name}\\
Bachelor of Science in Your Major\\
Month Year -- Month Year

\section*{Skills}
\begin{itemize}
    \item Programming Languages: Python, Java, JavaScript
    \item Web Technologies: React, Node.js, HTML, CSS
    \item Tools: Git, Docker, AWS
\end{itemize}

\section*{Experience}
\textbf{Job Title} -- Company Name\\
Month Year -- Present
\begin{itemize}
    \item Key achievement one
    \item Key achievement two
\end{itemize}

\end{document}`,

    beamer: String.raw`\documentclass{beamer}

\title{Presentation Title}
\author{Your Name}

\begin{document}

\frame{\titlepage}

\begin{frame}
\frametitle{Introduction}
\begin{itemize}
    \item Point one
    \item Point two
\end{itemize}
\end{frame}

\begin{frame}
\frametitle{Conclusion}
Thank you!
\end{frame}

\end{document}`,

    math: String.raw`\documentclass{article}

\title{Mathematical Document}
\author{Your Name}

\begin{document}
\maketitle

\section{Basic Equations}
Inline math: $a^2 + b^2 = c^2$

Display equation:
$$\int_{0}^{1} x^2 dx = \frac{1}{3}$$

\section{More Examples}
$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$

\end{document}`
};
