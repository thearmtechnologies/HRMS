# Source Code Editing Preference
For this project, always use direct source code editing tools (`replace_file_content`, `multi_replace_file_content`) as the default approach for modifying files. 
Do NOT generate temporary Python rewrite scripts (using regex or string replace) for small or medium changes affecting one or two files. 
Only generate Python rewrite scripts if there is a clear technical benefit (e.g., large-scale automated refactoring across many files) AND you must explicitly explain the reasoning to the user before doing so.
