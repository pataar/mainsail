<style>
.vue-codemirror .cm-editor {
}
</style>

<template>
    <div ref="codemirror" class="vue-codemirror">
        <div></div>
    </div>
</template>

<script lang="ts">
// Inspired by these repo: https://github.com/surmon-china/vue-codemirror

import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

/**
 * Monaco available languages
 */
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import 'monaco-editor/esm/vs/basic-languages/ini/ini.contribution'
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution'
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution'

// @ts-ignore
self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
        if (label === 'json') {
            return new JsonWorker()
        }

        return new EditorWorker()
    },
}

@Component
export default class Monaco extends Mixins(BaseMixin) {
    private content = ''

    private editor?: monaco.editor.IStandaloneCodeEditor = undefined

    declare $refs: {
        codemirror: HTMLElement
    }

    @Prop({ required: false, default: '' })
    declare readonly code: string

    @Prop({ required: false, default: '' })
    declare value: string

    @Prop({ required: false, default: 'codemirror' })
    declare readonly name: string

    @Prop({ required: false, default: '' })
    declare readonly fileExtension: string

    @Watch('value')
    valueChanged(value: string) {
        if (value !== this.editor?.getValue()) {
            this.editor?.setValue(value)
        }
    }

    filenameToLanguage(filename: string) {
        filename = filename.toLowerCase()

        if (filename.endsWith('.conf') || filename === 'printer.cfg') {
            return 'yaml'
        }

        if (filename.endsWith('.cfg')) {
            return 'ini'
        }

        if (filename.endsWith('.sh')) {
            return 'shell' //gcode
        }

        return undefined // let monaco decide
    }

    mounted(): void {
        this.editor = monaco.editor.create(this.$refs.codemirror, {
            value: this.value,
            language: this.filenameToLanguage(this.name),
            automaticLayout: true,
            scrollBeyondLastLine: false,
            scrollBeyondLastColumn: 0,
        })

        import('monaco-themes/themes/Night Owl.json').then((data) => {
            monaco.editor.defineTheme('nightowl', data)
            monaco.editor.setTheme('nightowl')
        })

        this.$nextTick(() => {
            console.dir(this.$refs.codemirror.parentNode)
            this.editor?.layout({
                height: this.$refs.codemirror.parentNode?.clientHeight,
                width: this.$refs.codemirror.parentNode?.clientWidth,
            })
        })

        this.editor.onDidChangeModelContent(() => {
            this.$emit('input', this.editor.getValue())
        })
    }

    beforeDestroy() {
        this.destroy()
    }

    destroy() {
        this.editor?.dispose()
    }
}
</script>
