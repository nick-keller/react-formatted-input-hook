import '@testing-library/jest-dom'

interface CustomMatchers<R = unknown> {
  toHaveCaret(text: string): R
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

expect.extend({
  toHaveCaret(received, text: string) {
    if (!(received instanceof HTMLInputElement)) {
      return {
        message: () =>
          this.utils.matcherErrorMessage(
            this.utils.matcherHint('toHaveCaret', undefined, `"${text}"`, {
              isNot: this.isNot,
              promise: this.promise,
            }),
            `${this.utils
              .RECEIVED_COLOR`received`} value must be an HTMLInputElement`,
            this.utils.printWithType(
              'Received',
              received,
              this.utils.printReceived
            )
          ),
        pass: Boolean(this.isNot),
      }
    }

    let state = received.value

    if (
      document.activeElement === received &&
      typeof received.selectionEnd === 'number'
    ) {
      state =
        state.slice(0, received.selectionEnd) +
        '|' +
        state.slice(received.selectionEnd)
    }

    if (
      document.activeElement === received &&
      typeof received.selectionStart === 'number' &&
      received.selectionEnd !== received.selectionStart
    ) {
      state =
        state.slice(0, received.selectionStart) +
        '|' +
        state.slice(received.selectionStart)
    }

    return {
      message: () =>
        this.utils.matcherHint('toHaveCaret', undefined, `"${text}"`, {
          isNot: this.isNot,
          promise: this.promise,
        }) +
        '\n\n' +
        this.utils.printDiffOrStringify(
          text,
          state,
          'Expected',
          'Received',
          this.expand ?? false
        ),
      pass: state === text,
    }
  },
})
