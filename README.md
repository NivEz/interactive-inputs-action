# Interactive Inputs GitHub Action

GitHub Action for executing interactive inputs via Telegram

## About

Interactive inputs are inputs that are being controlled durring the execution of a workflow run.

This means that instead of manually triggerring workflows with inputs (`workflow_dispatch` with `inputs`), you can utilize the Interactive Inputs Action. This action allows inputs to appear on Telegram while the workflow is running.

With this approach, you have control over the options presented to the user, including the duration for which the user can make a choice, among other parameters. Eventually, you will receive the user's choice and you will be able to use it in the rest of the workflow. Under the hood it works via long polling mechanism.

## Input Variables

| **Input**                  | **Description**                                                                                                                                                                     | **Default value**                      | **Required**                      |
|:--------------------------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:--------------------------------------:|:---------------------------------:|
| telegram-api-token         | Telegram API token                                                                                                                                                                  | -                                      | Yes                               |
| telegram-chat-id           | The Telegram chat id that will be used for the interactive inputs and messages                                                                                                      | -                                      | Yes                               |
| question                   | The question / statement that will be used in Telegram followed with buttons (each button represents one of the options)                                                            | -                                      | Yes when not using `simple-message` |
| options                    | The possible options (buttons) that will appear as the interactive inputs in Telegram - represented as a JSON array of strings                                                      | '[]'                                   |                                   |
| default-choice             | Default choice that will be used if the user did not choose any of the options in Telegram                                                                                          | -                                      |                                   |
| message                    | Message that will be sent thorugh Telegram after the user interaction has finished. It is possible to use %s as a variable that will be replaced with the selected choice           | The selected choice is: %s             |                                   |
| timeout                    | Timeout in seconds for selecting one of the possible options. When the timeout exceeds - stopping to check for updates from Telegram                                                | 60                                     |                                   |
| timeout-message            | Message that will be sent to Telegram if the timeout exceeds and the user did not select any of the options                                                                         | Timeout exceeded without any choice... |                                   |
| is-choosing-required       | If true - the user must choose one of the options - in case the user did not choose and there is no default choice - the timeout message will be sent and the run will be cancelled | true                                   |                                   |
| wait-for-timeout-to-finish | If true - the run will wait for the timeout to finish even if the user already chose one of the options - that will let the user to change his choice before the timeout exceeds    | false                                  |                                   |
| simple-message             | Just a simple message that will be sent through Telegram without any of the functionality of interactive inputs                                                                     | -                                      |                                   |


## Output

| **Output**  | **Description**                            |
|:-----------:|:------------------------------------------:|
| user-choice | The selected choice recieved from Telegram |


## Usage

```
name: Interactive Inputs
on: [push]
jobs:
  get-choice:
    runs-on: ubuntu-latest
    steps:
      - name: Test interactive inputs action
        id: interactive-inputs-action
        uses: NivEz/interactive-inputs-action@v1 # You can use a different version / tag @vx.x.x
        with:
          telegram-api-token: ${{ secrets.TELEGRAM_API_TOKEN }}
          telegram-chat-id: ${{ secrets.CHAT_ID }}
          question: How are you today?
          options: '["Good", "Bad", "Ok"]' # Notice the serialized JSON with quotes
          default-choice: Ok
      
      - name: Get output
        run: 'echo The user response is: ${{ steps.interactive-inputs-action.outputs.user-choice }}'                
```

You can change the inputs for different behaviour:
```
name: Interactive Inputs
on: [push]
jobs:
  get-choice:
    runs-on: ubuntu-latest
    steps:
      - name: Test interactive inputs action
        id: interactive-inputs-action
        uses: NivEz/interactive-inputs-action@v1
        with:
          telegram-api-token: ${{ secrets.TELEGRAM_API_TOKEN }}
          telegram-chat-id: ${{ secrets.CHAT_ID }}
          question: How are you today?
          timeout: 30
          options: '["Good", "Bad", "Ok"]'
          default-choice: Ok
          wait-for-timeout-to-finish: true
          message: 'Answer is: %s'
          timeout-message: You did not choose anything
          is-choosing-required: false
      
      - name: Get output
        run: 'echo The user response is: ${{ steps.interactive-inputs-action.outputs.user-choice }}'                
```

You can even send a simple Telegram message (without all the interactive inputs functionality):
```
name: Telegram Message
on: [push]
jobs:
  send-message:
    runs-on: ubuntu-latest
    steps:
      - name: Test simple message
        uses: NivEz/interactive-inputs-action@v1
        with:
          telegram-api-token: ${{ secrets.TELEGRAM_API_TOKEN }}
          telegram-chat-id: ${{ secrets.CHAT_ID }}
          simple-message: This is a simple message without any logic      
```

Note that you have other tags then `v1`, but `v1` is equivalent to the most updated v1.x.x. You can use a different version / tag @vx.x.x if you want.

### You can view a complete example in this repo [here](https://github.com/NivEz/interactive-inputs-action/blob/main/.github/workflows/ci.yaml).

---

### Don't forget to give it a ⭐