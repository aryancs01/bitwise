const bashConfig = ["/bin/bash", "-c"];

export const commands = {
    python: function(code: string, input: string){
        const runCommand = `echo '${code}' > code.py && echo '${input}' > input.txt && python code.py < input.txt`;
        return [...bashConfig, runCommand];
    },
    cpp: function(code: string, input: string){
        const runCommand = `echo '${code}' > code.cpp && echo '${input}' > input.txt && g++ code.cpp -o output && ./output < input.txt`;
        return [...bashConfig, runCommand];
    }
}

// echo -e "5\n10\nAryan Saxena" | ./output