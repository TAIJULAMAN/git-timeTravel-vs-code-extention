import { CommitInfo } from './gitService';

export function getWebviewContent(fileName: string, commits: CommitInfo[]): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            :root {
                --container-paddding: 20px;
                --input-padding-vertical: 6px;
                --input-padding-horizontal: 4px;
                --input-margin-vertical: 4px;
                --input-margin-horizontal: 0;
            }

            body {
                padding: 0;
                margin: 0;
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                user-select: none;
            }

            .container {
                width: 90%;
                max-width: 600px;
                text-align: center;
                background: var(--vscode-sideBar-background);
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                border: 1px solid var(--vscode-widget-border);
            }

            h2 {
                margin-top: 0;
                color: var(--vscode-textLink-foreground);
                font-weight: 500;
                margin-bottom: 15px;
            }

            .meta-date {
                font-size: 0.9em;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 5px;
            }

            .info-message {
                font-size: 1.1em;
                font-weight: bold;
                margin-bottom: 25px;
                min-height: 1.5em;
                color: var(--vscode-editor-foreground);
            }

            input[type=range] {
                -webkit-appearance: none;
                width: 100%;
                background: transparent;
                margin: 20px 0;
            }

            input[type=range]:focus {
                outline: none;
            }

            /* Slider Track */
            input[type=range]::-webkit-slider-runnable-track {
                width: 100%;
                height: 6px;
                cursor: pointer;
                background: var(--vscode-progressBar-background);
                border-radius: 3px;
            }

            /* Slider Thumb */
            input[type=range]::-webkit-slider-thumb {
                height: 18px;
                width: 18px;
                border-radius: 50%;
                background: var(--vscode-button-background);
                cursor: pointer;
                -webkit-appearance: none;
                margin-top: -6px; /* center on track */
                border: 2px solid var(--vscode-button-foreground);
                transition: transform 0.1s;
            }

            input[type=range]::-webkit-slider-thumb:hover {
                transform: scale(1.1);
                background: var(--vscode-button-hoverBackground);
            }

            .hash {
                font-family: 'Courier New', monospace;
                font-size: 0.8em;
                opacity: 0.7;
                background: var(--vscode-textBlockQuote-background);
                padding: 2px 5px;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>⏳ Time Travel: ${fileName}</h2>
            <div id="meta" class="meta-date"></div>
            <div id="info" class="info-message"></div>
            
            <!-- 
                Min = 0 (Oldest)
                Max = Length - 1 (Newest)
                Value = Length - 1 (Start at Now)
            -->
            <input type="range" id="timeline" min="0" max="${commits.length - 1}" value="${commits.length - 1}" step="1">
            
            <div id="hashDisplay" class="hash"></div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            
            // Commits come in as [Newest, ..., Oldest] from git log usually
            // We want the slider (0 to Max) to map to [Oldest, ..., Newest]
            // So we reverse the array on the client side for intuitive slider mapping
            const rawCommits = ${JSON.stringify(commits)};
            const commits = rawCommits.reverse(); // Now index 0 is Oldest, Last is Newest

            const slider = document.getElementById('timeline');
            const info = document.getElementById('info');
            const meta = document.getElementById('meta');
            const hashDisplay = document.getElementById('hashDisplay');

            function updateDisplay(index) {
                const commit = commits[index];
                info.innerText = commit.message;
                meta.innerText = commit.date;
                hashDisplay.innerText = commit.hash;
            }

            // Initialize display with current (last item)
            updateDisplay(commits.length - 1);

            slider.addEventListener('input', () => {
                const index = parseInt(slider.value);
                updateDisplay(index);
                
                // Debounce/Throttle could be here, but for now direct message
                vscode.postMessage({
                    command: 'jumpToCommit',
                    hash: commits[index].hash
                });
            });
        </script>
    </body>
    </html>
    `;
}
