$(document).ready(function() {
    $('.modal').modal();
    var copyGame = jQuery.extend(true, {}, game);
    //game object initiation
    var game = {
        boardV: ["&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp", "&nbsp"],
        playerX: "human",
        playerO: " ",
        turn: 1,
        state: "active",
        xs: [],
        os: [],
        winning: [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 4, 8],
            [2, 4, 6],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8]
        ],

        makeTurn: function(id1) {
            var idInt = id1;

            //if it's the turn of player 1 
            if (this.turn % 2 != 0) {
                this.boardV[idInt] = "X";
                this.xs.push(idInt);
                //if the second player is AI than the method is called instantly after the human makes it's move
                //I should mention that I don't check if the game is won right here (assuming the human made a winning move)
                //because the AI I made is unbeatable.
                if (this.playerO == "AI") findBestMove(this.boardV, this.os);
            } // second players turn ( If it's not a human )
            else if (this.playerO != "AI") {
                this.boardV[idInt] = "O";
                this.os.push(idInt);
            }

            //if the 2nd player is an AI than we skip the 2nd human players turn
            if (this.playerO == "AI") this.turn += 2;
            else this.turn++;

            //renders the board and it's values
            this.renderXO();

            //checks if the game is won
            this.checkWinner(game.boardV);
        },


        renderXO: function() {
            game.boardV.forEach(function(currentVal, index) {
                var selector = '#id' + index;
                $(selector).html('<p>' + currentVal + '</p>');
                if (currentVal == "O") $(selector).css("color", "#c0392b");
            })
        },

        checkWinner: function() {

            //we go trough the winning lines and if there is a line that is a subset of the x vector or o one, than we declare the winner
            game.winning.forEach(function(currentVal, index) {
                if (arrayContainsArray(game.xs, currentVal)) {
                    $('#modal1').modal('open');
                    $('.modal-content').html("<h4>Player 1 wins!</h4><p>Wanna go again?</p>");
                    game.state = "won";
                } else if (arrayContainsArray(game.os, currentVal)) {
                    $('#modal1').modal('open');
                    $('.modal-content').html("<h4>Player 2 wins!</h4><p>Wanna go again?</p>");
                    game.state = "won";
                }
            });

            //if there isn't any blank space on the board it means that the board is full and it was a draw 
            //(because the game.state hasn't changed, it's wasn't won already.
            if ($.inArray("&nbsp", game.boardV) == -1 && game.state == "active") {
                $('#modal1').modal('open');
                $('.modal-content').html("<h4>It's a draw!</h4><p>Wanna go again?</p>");
            }
        }

    }

    //checks if there are any moves left
    function isMovesLeft(board) {
        for (var i = 0; i < board.length; i++) {
            if (board[i] == "&nbsp")
                return true;
        }
        return false;
    }

    //checks the winner for the negamax algorithm
    function evaluate(board) {
        var valoare = 0;
        game.winning.forEach(function(currentVal2, index2) {
            if (arrayContainsArray(game.os, currentVal2)) {
                valoare = 10;
                return;
            } else if (arrayContainsArray(game.xs, currentVal2)) {
                valoare = -10;
                return;
            }
        });
        return valoare;
    }

    //the negamax algorithm. It is based on minimax, which is an algorithm that plays tic-tac-toe optimaly. Minimax uses a tree search
    //to find the best next move by simulating the all potential outcomes. You can find more on it by doing a Google search and I trully 
    //recommend you do that because it's a nice exercise to understand it and implement it (uses recursive functions). Negamax is the same
    //exact algorithm, but more elegant. It only uses the max for both the maximizer and the minimizer by  doing calling -negamax on the minimzer
    //turn.
    function negamax(board, depth, isMax) {

        //we evaluate if the current state is a winning one
        var score = evaluate(board);
        //if yes, than the value returned is the current max. the best value we can achieve is 10, meaning the AI won the game at that move.
        if (score != 0) {
            return -10 + depth;
        }
        //if the board is full return 0 ( no one won the game ).
        if (isMovesLeft(board) == false) return 0;

        //if it's the turn of the AIs opponent 
        if (isMax == true) {
            var value = "X";
        } else {
            var value = "O"
        };

        //the worst case scenario
        var max = -Infinity;
        var index;

        for (var i = 0; i < 9; i++) {
            if (board[i] == "&nbsp") {
                //the new state
                var newboard = board.slice();
                newboard[i] = value;
                //we add the next free move
                if (value == "X") game.xs.push(i);
                else if (value == "O") game.os.push(i);
                //on the AIs opponent turn, the max is actually min, because of the -
                var moveval = -negamax(newboard, depth + 1, !isMax);
                if (value == "X") game.xs.pop();
                else if (value == "O") game.os.pop();
                //if the current val is bigger than the max, than the best possible move takes that value
                if (moveval > max) {
                    max = moveval;
                    index = i;
                }

            }
        }

        //if the recursion got back to the first step, we add the best mobe to the board
        if (depth == 0) {
            console.log(index);
            game.boardV[index] = "O";
            game.os.push(index);
        }
        //return the current max
        return max;
    }


    function findBestMove(board) {
        negamax(board, 0, false);
    }


    function reset() {
        $('.square').remove();
        game = jQuery.extend(true, {}, copyGame);
    }

    function arrayContainsArray(superset, subset) {
        if (0 === subset.length) {
            return false;
        }
        return subset.every(function(value) {
            return (superset.indexOf(value) >= 0);
        });
    }

    function render() {
        for (var i = 0; i < game.boardV.length; i++) {
            $('#board').append("<div class='square' id='id" + i + "'></div>");
        }
    }

    $('.btn').click(function(event) {

        //if the user clicks on the buttons from the window (not from the modal), than they will be removed
        if (!$(this).hasClass("ans")) {
            $('.buttons').remove();
        } else window.location.reload(true);

        //renders the board.
        render();


        //selects the type of player based on the button that the user clicked;
        if (this.id == '1v1') game.playerO = "human";
        else if (this.id == 'AI') game.playerO = "AI";

        //event that triggers the actual turn making process. 
        $('.square').click(function(event) {

            //takes the id from the passed ellement, which is the square in this case. So it takes the id att of "this" square/
            var idInt = Number(this.id.substr(this.id.length - 1));

            //if the square is empty, than the move can be made
            if (game.boardV[idInt] == "&nbsp") {
                game.makeTurn(idInt);
            }
        })

    });


})
