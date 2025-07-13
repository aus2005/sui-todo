module todo_list::todo {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::String;

    /// A todo item
    public struct Todo has key, store {
        id: UID,
        content: String,
        completed: bool,
        owner: address,
    }

    /// Create a new todo item
    public fun create_todo(content: String, ctx: &mut TxContext) {
        let todo = Todo {
            id: object::new(ctx),
            content,
            completed: false,
            owner: tx_context::sender(ctx),
        };
        
        transfer::transfer(todo, tx_context::sender(ctx));
    }

    /// Toggle the completion status of a todo
    public fun toggle_todo(todo: &mut Todo, ctx: &TxContext) {
        assert!(todo.owner == tx_context::sender(ctx), 0);
        todo.completed = !todo.completed;
    }

    /// Update the content of a todo
    public fun update_todo(todo: &mut Todo, new_content: String, ctx: &TxContext) {
        assert!(todo.owner == tx_context::sender(ctx), 0);
        todo.content = new_content;
    }

    /// Delete a todo by transferring it to a burn address
    public fun delete_todo(todo: Todo, ctx: &TxContext) {
        assert!(todo.owner == tx_context::sender(ctx), 0);
        let Todo { id, content: _, completed: _, owner: _ } = todo;
        object::delete(id);
    }

    /// Getter functions for reading todo data
    public fun get_content(todo: &Todo): &String {
        &todo.content
    }

    public fun get_completed(todo: &Todo): bool {
        todo.completed
    }

    public fun get_owner(todo: &Todo): address {
        todo.owner
    }
}