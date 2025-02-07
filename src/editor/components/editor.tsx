import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { PreviewManager } from '../preview_manager';
import { debounce } from 'lodash';

interface EditorProps {
    initialContent?: string;
    onChange?: (content: string) => void;
    onSave?: (content: string) => void;
    theme?: 'light' | 'dark';
}

interface EditorState {
    content: string;
    previewData: any;
    isDirty: boolean;
    isLoading: boolean;
}

export const Editor: React.FC<EditorProps> = ({
    initialContent = '',
    onChange,
    onSave,
    theme = 'light'
}) => {
    // 状态管理
    const [state, setState] = useState<EditorState>({
        content: initialContent,
        previewData: null,
        isDirty: false,
        isLoading: false
    });

    // 引用
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const previewManagerRef = useRef<PreviewManager>(new PreviewManager());

    // 初始化编辑器
    useEffect(() => {
        if (containerRef.current) {
            editorRef.current = monaco.editor.create(containerRef.current, {
                value: initialContent,
                language: 'markdown',
                theme: theme === 'dark' ? 'vs-dark' : 'vs',
                automaticLayout: true,
                minimap: { enabled: true },
                wordWrap: 'on',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                renderWhitespace: 'boundary',
                contextmenu: true,
                rulers: [80],
                fontSize: 14
            });

            // 监听内容变化
            editorRef.current.onDidChangeModelContent(
                debounce(() => {
                    const content = editorRef.current?.getValue() || '';
                    handleContentChange(content);
                }, 500)
            );

            // 监听保存命令
            editorRef.current.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                () => {
                    const content = editorRef.current?.getValue() || '';
                    handleSave(content);
                }
            );
        }

        return () => {
            editorRef.current?.dispose();
        };
    }, []);

    // 主题变化
    useEffect(() => {
        monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }, [theme]);

    // 内容变化处理
    const handleContentChange = async (content: string) => {
        setState(prev => ({ ...prev, content, isDirty: true }));
        
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            const previewData = previewManagerRef.current.update_content(content);
            setState(prev => ({ ...prev, previewData }));
            onChange?.(content);
        } catch (error) {
            console.error('Preview update failed:', error);
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    // 保存处理
    const handleSave = async (content: string) => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            await onSave?.(content);
            setState(prev => ({ ...prev, isDirty: false }));
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    return (
        <div className="editor-container">
            <div className="toolbar">
                {/* 工具栏组件 */}
            </div>
            
            <div className="main-content">
                <div className="editor-area" ref={containerRef} />
                
                <div className="preview-area">
                    {/* 预览组件 */}
                    {state.previewData && (
                        <div className="preview-content">
                            {/* TODO: 实现预览渲染 */}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="status-bar">
                {/* 状态栏组件 */}
                <div className="status-item">
                    {state.isDirty ? '未保存' : '已保存'}
                </div>
                <div className="status-item">
                    {state.isLoading ? '加载中...' : '就绪'}
                </div>
            </div>
            
            <style jsx>{`
                .editor-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                }
                
                .toolbar {
                    height: 40px;
                    border-bottom: 1px solid #ddd;
                }
                
                .main-content {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }
                
                .editor-area {
                    flex: 1;
                    height: 100%;
                }
                
                .preview-area {
                    flex: 1;
                    height: 100%;
                    border-left: 1px solid #ddd;
                    overflow: auto;
                    padding: 20px;
                }
                
                .status-bar {
                    height: 25px;
                    border-top: 1px solid #ddd;
                    display: flex;
                    align-items: center;
                    padding: 0 10px;
                    font-size: 12px;
                    background: #f5f5f5;
                }
                
                .status-item {
                    margin-right: 15px;
                    color: #666;
                }
            `}</style>
        </div>
    );
}; 